// $Id$

/**
 * @file
 * Allows Javascript / Jquery functions to be executed.
 *
 * Provides interactivity with the Voyeur block.
 *
 * The Voyeur module implements many concepts and methods derived from
 * the CommentRSS module found here: http://drupal.org/project/commentrss.
 * Thank you Gábor Hojtsy for your hard work.
 */

Drupal.behaviors.VoyeurBehavior = function (context) {

  // Create references to these elements for use outside of function(context).
  var voyeurTool = Drupal.settings.voyeur.tool;
  var allowAutoReveal = Drupal.settings.voyeur.allowAutoReveal;
  var allowUser = Drupal.settings.voyeur.allowUser;
  var removeFuncWords = Drupal.settings.voyeur.removeFuncWords;
  var voyeurLimit = Drupal.settings.voyeur.limit;
  var voyeurQuery = Drupal.settings.voyeur.query;
  var rssUrl = Drupal.settings.voyeur.rssUrl;
  var viewSeparate = Drupal.settings.voyeur.viewSeparate;
  var rssUrlStrip = '';
  var voyeurLogo = $('#voyeurLogo');
  var voyeurFullPage = $('#voyeurFullPage');
  var voyeurIframe = $('#voyeurIframe');
  var ajaxRef = $.ajax; // Create reference to jQuery's AJAX function.

  if (allowUser == 'allow_user') {
    // First add elements to the reveal button to launch Thickbox if user can choose options.
    $('#voyeurReveal').addClass('thickbox').attr('alt', '#TB_inline?height=400&width=325&inlineId=voyeurControls');
    $('#voyeurReveal').attr('title', 'Voyeur - Reveal your texts');
    // NOTE: THIS IS WHERE YOU CAN CHANGE THICKBOX OPTIONS, HEIGHT AND WIDTH
  }

  // If admin has chosen autoReveal, just reveal Voyeur on page load
  if (allowAutoReveal == 'allow_auto_reveal') {
    if (allowUser != 'allow_user') { // If autoReveal is on and users cannot choose options, hide the 'Reveal' button.
      $('#voyeurReveal').attr('style', 'display:none;');
    }
    rssUrl = Drupal.settings.voyeur.rssUrl + '/'; // Set to default URL again for fresh click.
    rssUrlStrip = rssUrl.replace(/[\W]/g, '');
    loadVoyeur(voyeurTool, removeFuncWords, voyeurLimit, voyeurQuery, rssUrl, rssUrlStrip, voyeurLogo, voyeurFullPage, voyeurIframe, viewSeparate, ajaxRef);
  }

  // ===============================
  // ==      Main Voyeur Click    ==
  // ===============================

  $('#voyeurReveal').click(function() {
    // If admin has allowed users to choose options...
    if (allowUser == 'allow_user') { // Only present user options if click came from 'Reveal' button.
      $('#voyeurOptionsSubmit').click(function() { // Wait for submit click...
        var rssParams = '';
        var checkboxParams = '';
        rssUrl = Drupal.settings.voyeur.rssUrl + '/'; // Set to default URL again for fresh click.

        rssParams += '?&'; // Add '&' as makes reading in $_GET easier.

        if ($('#edit-voyeur-user-tool').val()) { // If tool set, set voyeurTool to it.
          voyeurTool = $('#edit-voyeur-user-tool').val();
        } else { // If for some reason no tool, set default to Cirrus.
          voyeurTool = 'Cirrus';
        }

        if ($('#voyeur-generate-user-forms :input:checkbox:checked').val()) { // If filters set, add to URL.
          rssParams += 'filters=';
          $('#voyeur-generate-user-forms :input:checkbox:checked').each(function() {
            checkboxParams += $(this).val() + ',';
          });
          checkboxParams = checkboxParams.slice(0, -1); // Remove the last comma for our URL.
          rssParams += checkboxParams;
        }
        
        if ($('#edit-voyeur-user-terms').val()) { // If terms set, add to URL.
          rssParams += '&terms=';
          rssParams += $('#edit-voyeur-user-terms').val();
        }

        if ($('#edit-voyeur-user-time').val()) { // If time set, add to URL.
          rssParams += '&time=';
          rssParams += $('#edit-voyeur-user-time').val();
        }

        if ($('#edit-voyeur-user-max').val()) { // If max items set, add to URL.
          rssParams += '&max=';
          rssParams += $('#edit-voyeur-user-max').val();
        }

        rssUrl += rawurlencode(rssParams);
        rssUrlStrip = rssUrl.replace(/[\W]/g, '');

        loadVoyeur(voyeurTool, removeFuncWords, voyeurLimit, voyeurQuery, rssUrl, rssUrlStrip, voyeurLogo, voyeurFullPage, voyeurIframe, viewSeparate, ajaxRef);
        $('#voyeurOptionsSubmit').unbind('click');
      });
    } else { // If user hit 'Reveal' and user defined options not turned on, just load Voyeur and hide 'Reveal' button.
      $('#voyeurReveal').attr('style', 'display:none;');
      rssUrl = Drupal.settings.voyeur.rssUrl + '/'; // Set to default URL again for fresh click.
      rssUrlStrip = rssUrl.replace(/[\W]/g, '');
      loadVoyeur(voyeurTool, removeFuncWords, voyeurLimit, voyeurQuery, rssUrl, rssUrlStrip, voyeurLogo, voyeurFullPage, voyeurIframe, viewSeparate, ajaxRef);
    }
    });
  
    // =========================================
    // ==     Individual Node Link Click      ==
    // =========================================
  
    $('.voyeurRevealNode').click(function() {
      voyeurTool = Drupal.settings.voyeur.tool; // Set to default tool again for fresh click.
      rssUrl = Drupal.settings.voyeur.rssUrl + '/'; // Set to default URL again for fresh click.
      rssParams = '?&n=' + $(this).attr('name'); // Finds the 'name' attr of our reveal link, which is the node ID.
      rssUrl += rawurlencode(rssParams);
      rssUrlStrip = rssUrl.replace(/[\W]/g, '');
  
      loadVoyeur(voyeurTool, removeFuncWords, voyeurLimit, voyeurQuery, rssUrl, rssUrlStrip, voyeurLogo, voyeurFullPage, voyeurIframe, viewSeparate, ajaxRef);
    });
} // end function(context)

/**
 * Loads Voyeur within the iFrame and changes attributes of page.
 *
 * @param voyeurTool
 *  The value of the selected tool by the user (within the Thickbox).
 * @param removeFuncWords
 *  Whether or not Voyeur removes function words. (Like 'the'.)
 * @param rssUrl
 *  The final, passed URL to our Voyeur RSS feed.
 * @param rssUrlStrip
 *  The same as rssUrl, but stripped of non-word characters.
 * @param voyeurLogo
 *  A reference to the voyeurLogo element on the page.
 * @param voyeurIframe
 *  A reference to the voyeurIframe element on the page.
 * @param viewSeparate
 *  A translated string for viewing Voyeur in a separate window.
 * @param ajaxRef
 *  A reference to jQuery's ajax function.
 */
function loadVoyeur(voyeurTool, removeFuncWords, voyeurLimit, voyeurQuery, rssUrl, rssUrlStrip, voyeurLogo, voyeurFullPage, voyeurIframe, viewSeparate, ajaxRef) {
  // Find recent article corpus timestamp first.
    ajaxRef({
      type: 'GET',
      dataType: 'text',
      async: false, // Wait until ajax completes.
      url: rssUrl + '&find_timestamp=1',
      success: function(msg) {
        unixTimestamp = msg;
      }
    });
  var fullVoyeurUrl = 'http://voyeurtools.org/tool/' + voyeurTool + '/?inputFormat=RSS2&splitDocuments=true&corpus=' + rssUrlStrip + unixTimestamp + '&archive=' + rssUrl;
  if (removeFuncWords === 'remove_func_words') {
    fullVoyeurUrl += '&stopList=stop.en.taporware.txt';
  }
  if (voyeurTool == 'Cirrus' && voyeurLimit != '') {
    fullVoyeurUrl += '&limit=' + voyeurLimit;
  }
  if (voyeurTool == 'CorpusTypeFrequenciesGrid' && voyeurQuery != '') {
    fullVoyeurUrl += '&query=' + voyeurQuery;
  }
  voyeurLogo.attr('style', 'display:none;'); // Hide the Voyeur logo.
  // Change the iFrame link to the custom URL for Voyeur, and remove the iFrame from being hidden.
  voyeurIframe.attr({
    // This is the URL to be sent to retrieve Voyeur information.
    src: fullVoyeurUrl
  }).removeAttr('style'); // Remove 'display:none'.
  //voyeurFullPage.html('<small><a href="'+ fullVoyeurUrl +'" target="_blank">'+ viewSeparate +'</a></small>');
} // end loadVoyeur()

/**
 * Same as the PHP function, 'rawurlencode'.
 *
 * @param str
 *    The string to be encoded.
 */
function rawurlencode (str) {
    // From http://kevin.vanzonneveld.net. Thank you!
    str = (str+'').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                                                                    replace(/\)/g, '%29').replace(/\*/g, '%2A');
} // end rawurlencode()
