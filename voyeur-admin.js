Drupal.behaviors.VoyeurBehaviorAdmin = function (context) {
	// Load our dynamic tool options right from the beginning.
	voyeurUpdateOptions($('.form-checkboxes'), $('#edit-voyeur-tool').val());
	$('#edit-voyeur-tool').change(function() {
		voyeurUpdateOptions($('.form-checkboxes'), $('#edit-voyeur-tool').val());
	});
}

/**
 * Handles changing options available when a user changes the tool.
 *
 * @param object voyeurSettingsForm References jQuery widget area.
 * @param string currentTool The current tool that was just selected.
 */
function voyeurUpdateOptions(voyeurSettingsForm, currentTool) {
  var fadeTime = 250;
  if (currentTool == 'Bubbles' || currentTool == 'Reader' || currentTool == 'WordCountFountain') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeOut(fadeTime);
  }
  if (currentTool == 'Cirrus') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
  }
  if (currentTool == 'CorpusTypeFrequenciesGrid') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
  }
  if (currentTool == 'Links') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
  }
  if (currentTool == 'CorpusSummary') {
    voyeurSettingsForm.find('#edit-voyeur-by-user-remove-func-words-wrapper').fadeIn(fadeTime);
  }
}