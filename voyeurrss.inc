<?php
// $Id$

/**
 * @file
 * Handles Voyeur RSS feed calls from voyeur.module.
 *
 * Builds the RSS feed to be sent to Voyeur. (http://voyeurtools.org).
 * Also generates a most recent corpus timestamp to return to voyeur.js.
 *
 * The Voyeur module implements many concepts and methods derived from
 * the CommentRSS module found here: http://drupal.org/project/commentrss.
 * Thank you Gábor Hojtsy for your hard work.
 */

/**
 * Menu callback; publish an RSS feed or publish corpus timestamp.
 */
function voyeurrss_handler() {
  if (call_user_func('voyeurrss_publish')) {
    return;
  }
  drupal_not_found();
} // end voyeurrss_handler()

/**
 * Publish a feed or corpus timestamp.
 *
 * @return boolean
 *    Returns true if our function calls were successful.
 */
function voyeurrss_publish() {
  // If we're searching for the unix timestamp, just print return value of voyeurrss_find_items().
  if ($_GET['find_timestamp'] == 1) {
    print voyeurrss_find_items();
  } else {
    $items = voyeurrss_find_items();
    voyeurrss_format_feed($items);
  }
  return TRUE;
} // end voyeurrss_publish()

/**
 * Find items to be generated within RSS for the Voyeur module or the corpus timestamp.
 *
 * @return int
 *  The most recent timestamp in the corpus.
 * @return array
 *   Found items / nodes to construct RSS feed.
 */
function voyeurrss_find_items() {
  $default_filters = voyeurrss_find_filters();
  $by_user = variable_get('voyeur_by_user', array('allow_auto_reveal' => 'allow_auto_reveal', 'allow_user' => '', 'allow_node' => '', 'remove_func_words' => 'remove_func_words'));
  
  // == Read in filtering options ============================================================

  // ===========================
  // ==      SPECIFIC NODE    ==
  // ===========================

  if (isset($_GET['n']) && $by_user['allow_node'] === 'allow_node') {
    // Clean up $_GET so only nid exists
    $clean_get = array_intersect_key($_GET, array('n' => ''));
    
    // If we're generating timestamp, find it and don't generate RSS content.
    if (isset($_GET['find_timestamp']) && $_GET['find_timestamp'] == 1) {
      // Build individual node SQL query.
      $sql = 'SELECT timestamp FROM {node_revisions} WHERE nid = ';
      $sql .= (int) $clean_get['n'] . ' ';
      $sql .= 'ORDER BY timestamp DESC LIMIT 1';
      $nodes = db_query(db_rewrite_sql($sql));
    } else {
      $items = voyeurrss_generate_content(node_load(intval($clean_get['n'])));
    }
    unset($clean_get);
  }

  // ===========================
  // ==     MULTIPLE NODES    ==
  // ==    (by user filter)   ==
  // ===========================

  elseif ((isset($_GET['filters']) || isset($_GET['terms']) || isset($_GET['time']) || isset($_GET['max'])) && $by_user['allow_user'] === 'allow_user') {
    // Clean up $_GET so only user filters exist
    $clean_get = array_intersect_key($_GET, array('filters' => '', 'terms' => '', 'time' => '', 'max' => ''));

    // Construct $voyeur_filters.
    if ($clean_get['filters'] != '') {
      $voyeur_filters = '';
      if (strstr($clean_get['filters'], ',')) { // If multiple filters, go thru.
        $user_filters = explode(',', $clean_get['filters']);
        foreach ($user_filters as $filter) {
          $voyeur_filters[$filter] = $filter;
        }
      }
      else { // If only one filter...
        $voyeur_filters[$clean_get['filters']] = $clean_get['filters'];  
      }
      // Make sure we're only dealing with filters that are allowed (Prevent silly $_GET input.)
      $voyeur_filters = array_intersect_key($voyeur_filters, $default_filters['default_options']);
    }

    // Construct $voyeur_terms.
    if ($clean_get['terms'] != '' && module_exists('taxonomy')) {
      $voyeur_terms = voyeurrss_explode_terms(trim($clean_get['terms']));
    }
    
    // Construct $voyeur_time
    if ($clean_get['time'] != 'none' || $clean_get['time'] != '') {
      $voyeur_time = $clean_get['time'];
    }

    // Construct $voyeur_max
    if ($clean_get['max'] != '') {
      $voyeur_max = (int) $clean_get['max'];
    }
    unset($clean_get);
  }

  // =============================
  // ==      MULTIPLE NODES     ==
  // ==    (by admin options)   ==
  // =============================
  
  else {
    // Read in admin-specified filtering options
    $voyeur_filters = variable_get('voyeur_filters', $default_filters['defaultFilters']);
    if (variable_get('voyeur_terms', '') != '' && module_exists('taxonomy')) { // Only explode terms if they're not blank
      $voyeur_terms = voyeurrss_explode_terms(trim(variable_get('voyeur_terms', '')));
    }
    $voyeur_time = variable_get('voyeur_time', 'month');
    $voyeur_max = variable_get('voyeur_max', '');
  }

  // == Find RSS items (via SQL) ============================================================

  // If $items and $nodes doesn't exist yet, it means we're NOT reading in specific node,
  // and therefore reading in params from user options or just running Voyeur
  // from admin options. So, begin constructing the SQL query to find specific
  // items (aka nodes) pertaining to filters.
  if (!isset($items) && !isset($nodes)) {
    $params = array();
    $joins = '';
    $where = '';
    $voyeur_filters = array_filter($voyeur_filters); // Get rid of filters that are not set (or, equal to 0)

    // Set which node filters are used.
    if (count($voyeur_filters)) {
      $where .= '(';
      foreach ($voyeur_filters as $filter) {
        $where .= 'n.type = \''. $filter .'\' OR ';
      }
      $where = rtrim($where, 'OR '); // Trim the last OR operator off.
      $where .= ') AND ';
    }
    
    // Add 'terms' joins and where clauses.
    if ($voyeur_terms) {
      // Add our joining to the terms table to gain term info.
      $joins .= 'INNER JOIN {term_node} tn ON n.nid = tn.nid INNER JOIN {term_data} td ON tn.tid = td.tid ';
      $where .= '(';
      foreach ($voyeur_terms as $term) {
        $where .= 'td.name = \'%s\' OR ';
        $params[] = $term; // Construct $params to store user-inputted terms for sanitization
      }
      $where = rtrim($where, 'OR '); // Trim the last OR operator off.
      $where .= ') AND ';
    }

    // Add 'time' joins and where clauses.
    if ($voyeur_time && $voyeur_time != 'none') {
      switch ($voyeur_time) {
        case 'day':
          $time_filter = time() - 86400;
          break;

        case 'week':
          $time_filter = time() - 604800;
          break;

        case '2weeks':
          $time_filter = time() - 1209600;
          break;

        case 'month':
          $time_filter = time() - 2629744;
          break;

        case '6months':
          $time_filter = time() - 15778463;
          break;

        default: // This is for year, or if silly $_GET input.
          $time_filter = time() - 31556926;
      }
      $where .= "nr.timestamp > $time_filter AND ";
    }

    // Build final SQL query.
    $sql = 'SELECT DISTINCT(n.nid), n.title, nr.body, nr.timestamp, u.name FROM {node} n ';
    $sql .= $joins .'INNER JOIN {node_revisions} nr ON nr.nid = n.nid INNER JOIN {users} u ON nr.uid = u.uid WHERE ';
    $sql .= $where .'n.status = 1 ';
    $sql .= 'ORDER BY nr.timestamp DESC';

    // Execute the query with any 'max' information passed by user / set by admin.
    if ($voyeur_max != '' && $voyeur_max != 0) {
      if (empty($params)) { // Check to see if we need to run through params for placeholders.
        $nodes = db_query_range(db_rewrite_sql($sql), 0, $voyeur_max);
      }
      else {
        $nodes = db_query_range(db_rewrite_sql($sql), $params, 0, $voyeur_max);
      }
    }
    else {
      $nodes = db_query(db_rewrite_sql($sql), $params);
    }
    
    if (!isset($_GET['find_timestamp']) || $_GET['find_timestamp'] != 1) {
      // Add all of the nodes to be published to $items.
      $items = '';
      while ($node = db_fetch_object($nodes)) {
        $items .= voyeurrss_generate_content($node);
      }
    }
  }
  
  // Generate most recent timestamp via ajax if $_GET param says so.
  if (isset($_GET['find_timestamp']) && $_GET['find_timestamp'] == 1) {
    $unixNode = db_fetch_object($nodes);
    return intval($unixNode->timestamp);
  }

  return $items;
} // end voyeurrss_find_items()

/**
 * Format and print a complete feed for Voyeur.
 *
 * @param $items
 *   XML fragment for the items. @see voyeurrss_find_items()
 */
function voyeurrss_format_feed($items) {
  global $base_url, $language;

  $channel = array(
    'version'     => '2.0',
    'title'       => 'Voyeur Tools RSS feed',
    'link'        => $base_url,
    'language'    => $language->language
  );
  $namespaces = array('xmlns:dc' => 'http://purl.org/dc/elements/1.1/');

  $output = '<?xml version="1.0" encoding="utf-8" ?>'."\n";
  $output .= '<rss version="'. $channel['version'] .'" xml:base="'. $base_url .'"'. drupal_attributes($namespaces) .">\n";
  $output .= format_rss_channel($channel['title'], $channel['link'], $channel['description'], $items, $channel['language']);
  $output .= "</rss>\n";

  drupal_set_header('Content-Type: application/rss+xml; charset=utf-8');
  print $output;
} // end voyeurrss_format_feed()

/**
 * Generate the content for use within our custom RSS feed.
 *
 * @param object $node
 *    The current node object.
 *
 * @return
 *     The generated RSS content.
 */
function voyeurrss_generate_content($node) {
  global $base_url;

  // Strip tags off of body so Voyeur doesn't read in tags.
  $content = check_plain(strip_tags($node->body));
  $link = url('node/' . $node->nid, array('absolute' => TRUE));
  $extra = array(
    array(
      'key' => 'comments',
      'value' => $base_url . '/' . $node->nid . '#comments'
    ),
    array(
      'key' => 'pubDate',
      'value' => date('r', $node->timestamp)
    ),
    /* Banish dc:creator as creates error within Voyeur RSS reader
    array(
      'key' => 'dc:creator',
      'value' => check_plain($node->name)
    ),
    */
    array(
      'key' => 'guid',
      'value' => $node->nid . ' at ' . $base_url,
      'attributes' => array('isPermaLink' => 'false')
    )
  );

  return format_rss_item($node->title, $link, $content, $extra);
} // end voyeurrss_generate_content()

/**
* Finds which kinds of content have been published on this site.
* Used to specify which filters can be displayed on the admin panel for Voyeur,
* (or options on the user Thickbox), and which options can be default assigned.
*
* @return array
*    The proper content types to filter
*/
function voyeurrss_find_filters() {
  $query = 'SELECT DISTINCT nt.type, nt.name FROM {node_type} nt INNER JOIN {node} n ON nt.type = n.type WHERE n.status = 1';
  $nodes = db_query(db_rewrite_sql($query));

  while ($node = db_fetch_object($nodes)) {
    $voyeur_filters['possible_options'][$node->type] = $node->name;
    $voyeur_filters['default_options'][$node->type] = $node->type;
  }

  return $voyeur_filters;
} // end voyeurrss_find_filters()

/**
* Standard method of creating an array from defined terms (seperated by ',').
*
* @param string $terms
*    All of the specified terms.
*
* @return array
*    An array of all of the defined terms.
*/
function voyeurrss_explode_terms($terms) {
    if (strstr($terms, ',')) { // If multiple terms, go thru.
      $user_terms = explode(',', $terms);
      foreach ($user_terms as $term) {
        $final_terms[] = $term;
      }
    }
    else { // If only one term...
      $final_terms[] = $terms;
    }
  return $final_terms;
} // end voyeurrss_explode_terms()
