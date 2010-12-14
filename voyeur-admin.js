Drupal.behaviors.VoyeurBehaviorAdmin = function (context) {
	// Load our dynamic tool options right from the beginning.
	voyeurUpdateOptions($('#voyeur-admin'), $('#edit-voyeur-tool').val());
	$('#edit-voyeur-tool').change(function() {
		voyeurUpdateOptions($('#voyeur-admin'), $('#edit-voyeur-tool').val());
	});
}

/**
 * Handles changing options available when a user changes the tool.
 *
 * @param object voyeurSettingsForm References jQuery widget area.
 * @param object voyeurSettingsForm References jQuery widget area.
 * @param string currentTool The current tool that was just selected.
 */
function voyeurUpdateOptions(voyeurSettingsForm, currentTool) {
  var fadeTime = 250;
  if (currentTool == 'Reader' || currentTool == 'WordCountFountain') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeOut(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-limit-wrapper').fadeOut(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-query-wrapper').fadeOut(fadeTime);
  }
  if (currentTool == 'Cirrus') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-limit-wrapper').fadeIn(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-query-wrapper').fadeOut(fadeTime);
  }
  if (currentTool == 'CorpusTypeFrequenciesGrid') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-limit-wrapper').fadeOut(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-query-wrapper').fadeIn(fadeTime);
  }
  if (currentTool == 'Bubbles' || currentTool == 'Links') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-limit-wrapper').fadeOut(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-query-wrapper').fadeOut(fadeTime);
  }
  if (currentTool == 'CorpusSummary') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-limit-wrapper').fadeOut(fadeTime);
    voyeurSettingsForm.find('#edit-voyeur-query-wrapper').fadeOut(fadeTime);
  }
}