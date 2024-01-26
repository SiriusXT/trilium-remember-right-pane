/*
trilium-remember-right-pane.js version:0.1 for trilium:>0.58.4
https://github.com/SiriusXT/trilium-remember-right-pane
*/

var currentNoteThis;
var isBound = false;
function setTocLabel(value) {
    api.runOnBackend((currentNoteID, value) => {
        api.getNote(currentNoteID).setLabel("toc", value);
    }, [currentNoteThis.noteId, value]);
}

function delTocLabel() {
    api.runOnBackend((currentNoteID, value) => {
        api.getNote(currentNoteID).removeLabel("toc");
    }, [currentNoteThis.noteId, 1]);
}

function setHllLabel(value = false) {
    api.runOnBackend((currentNoteID, value) => {
        api.getNote(currentNoteID).setLabel("hideHighlightWidget", value);
    }, [currentNoteThis.noteId, value]);
}

function delHllLabel(noteId) {
    api.runOnBackend((currentNoteID) => {
        api.getNote(currentNoteID).removeLabel("hideHighlightWidget");
    }, [currentNoteThis.noteId]);
}

class RememberRightPane extends api.NoteContextAwareWidget {
    get position() {
        return 100;
    }
    get parentWidget() {
        return 'center-pane';
    }
    isEnabled() {
        return super.isEnabled();
    }
    doRender() {
        this.$widget = $(`<style type="text/css">{ 
            .unfold-toc{
                display:none;
            }
            .unfold-hll{
                display:none;
            }
        }</style>`);//
        return this.$widget;

    }

    async toogleTocLabel() {
        var note = currentNoteThis.note
        if (currentNoteThis.noteContext.viewScope.tocTemporarilyHidden == true || (note.hasLabel("toc") && note.getLabel("toc").value == "hide")) {//when already hidden
            currentNoteThis.noteContext.viewScope.tocTemporarilyHidden = false
            setTocLabel("hide");
            delTocLabel();
        }
        else {
            setTocLabel("hide");
        }
    }

    async toogleHllLabel() {
        var note = currentNoteThis.note
        if (currentNoteThis.noteContext.viewScope.highlightsListTemporarilyHidden == true || (note.hasLabel("hideHighlightWidget") && (note.getLabel("hideHighlightWidget").value == "" || note.getLabel("hideHighlightWidget").value != false))) {//when already hidden
            currentNoteThis.noteContext.viewScope.highlightsListTemporarilyHidden = false
            setHllLabel(false);
            delHllLabel();
        }
        else {
            setHllLabel(true);
        }
    }

    async refreshWithNote(note) {
        //console.log("trilium-remember-right-pane");
        if (this.note.type == 'text') {
            if (this.noteContext.viewScope.tocPreviousVisible == true || this.noteContext.viewScope.tocPreviousVisible == undefined) {
                if (this.noteContext.viewScope.tocTemporarilyHidden == true || (note.hasLabel("toc") && note.getLabel("toc").value == "hide")) {//when already hidden
                    $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-toc").css("display", "block");
                } else {
                    $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-toc").css("display", "none");
                }
            }
            else {
                $(".ribbon-button-container .unfold-toc").css("display", "none");
            }
            if (this.noteContext.viewScope.highlightsListPreviousVisible == true || this.noteContext.viewScope.highlightsListPreviousVisible == undefined) {
                if (this.noteContext.viewScope.highlightsListTemporarilyHidden == true || (note.hasLabel("hideHighlightWidget") && (note.getLabel("hideHighlightWidget").value == "" || note.getLabel("hideHighlightWidget").value != false))) {//when already hidden
                    $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-hll").css("display", "block");
                } else {
                    $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-hll").css("display", "none");
                }
            } else {
                $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-hll").css("display", "none");
            }
        } else {
            $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-toc").css("display", "none");
            $(".note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-hll").css("display", "none");
            return;
        }

        currentNoteThis = this;
        var toogleTocLabel = this.toogleTocLabel;
        var toogleHllLabel = this.toogleHllLabel;

        if ($('.note-split.type-text:not(.hidden-ext) .ribbon-button-container .unfold-toc').length == 0) {
            var tocB = $('<button class="button-widget bx component icon-action bx-objects-horizontal-left unfold-toc" data-toggle="tooltip" title="Unfold Toc" data-placement="bottom"></button>').on('click', function (event) {
                toogleTocLabel();
            });
            $('.note-split.type-text:not(.hidden-ext) .ribbon-button-container').append(tocB);
            // currentNoteThis.refresh(); //I can't remember why this line is there.
        }

        if ($('.note-split.type-text:not(.hidden-ext)  .ribbon-button-container .unfold-hll').length == 0) {
            var hllB = $('<button class="button-widget bx component icon-action bx-highlight unfold-hll" data-toggle="tooltip" title="Unfold Highlightslist" data-placement="bottom"></button>').on('click', function (event) {
                toogleHllLabel();
            });
            $('.note-split.type-text:not(.hidden-ext) .ribbon-button-container').append(hllB);
            // currentNoteThis.refresh(); //I can't remember why this line is there.
        }


        // Listen for close button
        $(document).ready(function () {
            var maxRetries = 5;
            var retryInterval = 500;
            function tryToGetElement(retries) {
                var targetElements = $('#right-pane .button-widget.bx.component.icon-action.bx-x');
                if (targetElements.length > 0) {
                    if (!isBound) {
                        // currentNoteThis.refresh(); //I can't remember why this line is there.
                        $(targetElements[0]).on('click', function () {
                            setTocLabel("hide");
                        });
                        $(targetElements[1]).on('click', function () {
                            setHllLabel(true);
                        });
                        isBound = true;
                    }
                } else {
                    if (retries > 0) {
                        setTimeout(function () {
                            tryToGetElement(retries - 1);
                        }, retryInterval);
                    }
                }
            }
            tryToGetElement(maxRetries);
        });


    }

    async entitiesReloadedEvent({ loadResults }) {
        this.refresh();
    }

}

module.exports = new RememberRightPane();

