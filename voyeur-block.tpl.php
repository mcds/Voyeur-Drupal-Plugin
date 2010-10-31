<?php
// $Id:

/**
 * @file voyeur-block.tpl.php
 * The block content for the Voyeur module.
 *
 * The contents are rendered to the block when a user has permission / access
 * to content, defined in the administrator permissions.
 *
 * The Voyeur module implements many concepts and methods derived from
 * the CommentRSS module found here: http://drupal.org/project/commentrss.
 * Thank you Gábor Hojtsy for your hard work.
 *
 * Available variables:
 *   - $voyeur_forms: The generated forms (from voyeur.module) for the user Thickbox.
 *
 * @see voyeur_preprocess_get_block()
 * @see _voyeur_generate_user_forms()
 */
?>

<img id="voyeurLogo" src="<?php print url(NULL, array('absolute' => TRUE)) . drupal_get_path('module', 'voyeur'); ?>/images/voyeur.png" alt="Voyeur <?php print t('logo'); ?>" border="0" style="text-align: center" />
<iframe width="<?php print variable_get('voyeur_width', 200); ?>" height="<?php print variable_get('voyeur_height', 250); ?>" src="" style="display:none;" id="voyeurIframe">
  <p>
    Your browser does not support iframes - Voyeur will not run.
  </p>
</iframe>
<div id='voyeurFullPage'><!-- 'View full page' link placed dynamically here. --></div>
<br />
<input type="button" id="voyeurReveal" value="Reveal" />
<div style="display:none;">
  <div id="voyeurControls">
    <br />
    <h3><strong>What should Voyeur reveal?</strong></h3>
    <small><?php print t('These settings determine which nodes') . ' Voyeur ' . t('will analyze or "reveal".'); ?></small>
    <?php print $voyeur_forms; ?>
    <br />
    <input type="button" id="voyeurOptionsSubmit" value="Submit" onclick="parent.tb_remove();" />
  </div>
</div>
