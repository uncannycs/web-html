/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("web_widget_ckeditor.field_ckeditor", function (require) {
    "use strict";

    const core = require("web.core");
    const session = require("web.session");
    const config = require("web.config");
    const ajax = require("web.ajax");
    const rpc = require("web.rpc");
    const basic_fields = require("web.basic_fields");
    const field_registry = require("web.field_registry");
    const _lt = core._lt;
    const TranslatableFieldMixin = basic_fields.TranslatableFieldMixin;

    // Load configuration for the editor
    const getCKEditorConfigPromise = rpc.query({
        model: "ir.config_parameter",
        method: "get_web_widget_ckeditor_config",
    });

    // Load CKEditor localization files
    async function loadCKEditorLanguageSource(languageCode) {
        if (languageCode === "en") {
            return;
        }
        const languageURL = `/web_widget_ckeditor/static/lib/ckeditor/build/translations/${languageCode}.js`;
        try {
            ajax.loadJS(languageURL);
        } catch (error) {
            console.warn("Unable to load CKEditor language: ", languageCode);
        }
    }
    const CKEditorLanguageCode = session.user_context.lang.split("_")[0];
    const loadCKEditorLanguagePromise = loadCKEditorLanguageSource(
        CKEditorLanguageCode
    );

    const FieldHtmlCKEditor = basic_fields.DebouncedField.extend(
        TranslatableFieldMixin,
        {
            description: _lt("Html (CKEditor)"),
            className: "oe_form_field oe_form_field_html oe_form_field_html_ckeditor",
            supportedFieldTypes: ["html"],

            /**
             * @override
             */
            willStart: function () {
                return Promise.all([
                    this._super.apply(this, arguments),
                    loadCKEditorLanguagePromise,
                ]);
            },

            /**
             * @override
             */
            destroy: function () {
                if (this.ckeditor) {
                    this.ckeditor.destroy();
                    this.ckeditor = undefined;
                }
                return this._super();
            },

            // --------------------------------------------------------------------------
            // Public
            // --------------------------------------------------------------------------

            /**
             * @override
             */
            activate: function () {
                if (this.ckeditor) {
                    this.ckeditor.focus();
                    return true;
                }
            },
            /**
             * This function is similar to the one found in core's web_editor.FieldHtml.
             *
             * @override
             */
            isSet: function () {
                // Removing spaces & html spaces
                const value =
                    this.value &&
                    this.value.split("&nbsp;").join("").replace(/\s/g, "");
                return (
                    value &&
                    value !== "<p></p>" &&
                    value !== "<p><br></p>" &&
                    value.match(/\S/)
                );
            },
            /**
             * This function is similar to the one found in core's web_editor.FieldHtml.
             *
             * @override
             */
            getFocusableElement: function () {
                return this.$target || $();
            },
            /**
             * Do not re-render this field if it was the origin of the onchange call.
             * This function is similar to the one found in core's web_editor.FieldHtml.
             *
             * @override
             */
            reset: function (record, event) {
                this._reset(record, event);
                const value = this._textToHtml(this.value);
                if (!event || event.target !== this) {
                    if (this.mode === "edit") {
                        this.ckeditor.setData(value);
                    } else {
                        this.$content.html(value);
                    }
                }
                return Promise.resolve();
            },

            // --------------------------------------------------------------------------
            // Private
            // --------------------------------------------------------------------------

            /**
             * @override
             */
            _getValue: function () {
                if (this.mode === "edit" && this.ckeditor) {
                    return this.ckeditor.getData();
                }
                return this.$target.val();
            },
            /**
             * Gets the CKEditor toolbar items configuration.
             * If not found, returns the default configuration.
             */
            _getCKEditorToolbarItems: async function () {
                try {
                    const ckconfig = await getCKEditorConfigPromise;
                    if (ckconfig.toolbar) {
                        return ckconfig.toolbar.split(/[\s,]+/).filter((item) => item);
                    }
                } catch (error) {
                    console.warn(
                        "Unable to use CKEditor toolbar configuration: ",
                        error
                    );
                    console.warn(
                        "Please check the value for ir.config_parameter 'web_widget_ckeditor.toolbar' is correct"
                    );
                    console.warn("Using default toolbar configuration");
                }
                return [
                    "heading",
                    "highlight",
                    "list",
                    "exportWord",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "removeFormat",
                    "|",
                    "once",
                    "todoList",
                    "fontSize",
                    "fontColor",
                    "fontFamily",
                    "lineHeight",
                    "fontBackgroundColor",
                    "|",
                    "bulletedList",
                    "numberedList",
                    "alignment",
                    "|",
                    "outdent",
                    "indent",
                    "pagebreak",
                    "|",
                    "link",
                    "imageUpload",
                    "blockQuote",
                    "insertTable",
                    "plugins",
                    "|",
                    "undo",
                    "redo",
                    "simpleUpload",
                    "revisionHistory",
                ];
            },
            /**
             * Gets the CKEditor configuration.
             * See for details:
             * https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html
             *
             * @returns EditorConfig
             */
            _getCKEditorConfig: async function () {

                var fontFamilyList = this.listFonts()
                console.log("List--", fontFamilyList)
                const res = {
                    toolbar: {
                        items: await this._getCKEditorToolbarItems(),
                        shouldNotGroupWhenFull: true,
                    },
                    language: CKEditorLanguageCode,
                    image: {
                        toolbar: [
                            "imageTextAlternative",
                            "imageStyle:inline",
                            "imageStyle:block",
                            "imageStyle:side",
                            "linkImage",
                        ],
                    },
                    table: {
                        contentToolbar: [
                            "tableColumn",
                            "tableRow",
                            "mergeTableCells",
                            "tableCellProperties",
                            "tableProperties",
                        ],
                    },
                    fontFamily: {
                        options: fontFamilyList,
                        supportAllValues: true
                    },
                    fontSize: {
                        options: [
                           'default',
                            8,
                            9,
                            10,
                            11,
                            12,
                            14,
                            18,
                            24,
                            36,
                            48,
                            62,
                        ],
                        supportAllValues: true
                    },
                    lineHeight: { // specify your otions in the lineHeight config object. Default values are [ 0, 0.5, 1, 1.5, 2 ]
                        options: [ 0.5, 1, 1.5, 2, 2.5 , 3, 4, 5, 6, 7, 8, 9, 10],
                         supportAllValues: true
                    },
                };
                if (config.isDebug()) {
                    res.toolbar.items.push("sourceEditing");
                }
                return res;
            },

            listFonts: function() {
              let { fonts } = document;
              const it = fonts.entries();

              let arr = [];
              let done = false;
              while (!done) {
                const font = it.next();
                console.log("Font--", font)
                if (!font.done && !arr.includes(font.value[0].family)) {
                  arr.push(font.value[0].family);
                } else {
                  done = font.done;
                }
              }
              return arr;
            },
            /**
             * Create the CKEditor instance with the target (this.$target)
             * then add the editable content (this.$content).
             *
             * @private
             * @returns {$.Promise}
             */
            _createCKEditorIntance: async function () {
                const editorConfig = await this._getCKEditorConfig();
                this.ckeditor = await window.ClassicEditor.create(
                    this.$target.get(0),
                    editorConfig
                );
                // Register event hooks
                this.ckeditor.on("change", () => this._onChange());
                this.ckeditor.ui.focusTracker.on(
                    "change:isFocused",
                    (ev, name, isFocused) => (isFocused ? null : this._onChange())
                );
                this._onLoadCKEditor();
            },
            /**
             * @override
             */
            _renderEdit: function () {
                const value = this._textToHtml(this.value);
                this.$target = $("<textarea>").val(value).hide();
                this.$target.appendTo(this.$el);
                return this._createCKEditorIntance();
            },
            /**
             * @override
             */
            _renderReadonly: function () {
                const value = this._textToHtml(this.value);
                this.$el.empty();
                this.$content = $('<div class="o_readonly"/>').html(value);
                this.$content.appendTo(this.$el);
            },
            /**
             * This function is similar to the one found in core's web_editor.FieldHtml.
             *
             * @private
             * @param {String} text
             * @returns {String} the text converted to html
             */
            _textToHtml: function (text) {
                let value = text || "";
                try {
                    // Crashes if text isn't html
                    $(text)[0].innerHTML; // eslint-disable-line
                } catch (e) {
                    if (value.match(/^\s*$/)) {
                        value = "<p><br/></p>";
                    } else {
                        value =
                            "<p>" +
                            value.split(/<br\/?>/).join("<br/></p><p>") +
                            "</p>";
                        value = value
                            .replace(/<p><\/p>/g, "")
                            .replace("<p><p>", "<p>")
                            .replace("<p><p ", "<p ")
                            .replace("</p></p>", "</p>");
                    }
                }
                return value;
            },

            // --------------------------------------------------------------------------
            // Handler
            // --------------------------------------------------------------------------

            /**
             * Method called when the CKEditor instance is loaded.
             *
             * @private
             */
            _onLoadCKEditor: function () {
                const $button = this._renderTranslateButton();
                $button.css({
                    "font-size": "15px",
                    position: "absolute",
                    right: "+5px",
                    top: "+5px",
                });
                this.$el.append($button);
            },
            /**
             * Method called when ckeditor triggers a change.
             *
             * @private
             * @param {OdooEvent} ev
             */
            _onChange: function () {
                this._doDebouncedAction.apply(this, arguments);
            },
        }
    );

    field_registry.add("ckeditor", FieldHtmlCKEditor);

    return FieldHtmlCKEditor;
});
