
{
    "name": "CKEditor",
    "summary": "",
    "version": "15",
    "website": "www.snit.sa",
    "category": "Web",
    "author": "snit",
    "depends": ["web_editor", "base_setup"],
    "data": ["views/res_config_settings_views.xml", "views/templates.xml"],
    'assets': {
        'web.assets_backend': [
            'web_widget_ckeditor/static/lib/ckeditor/build/ckeditor.js',
            # 'web_widget_ckeditor/static/src/js/lineheight.min.js',
            'web_widget_ckeditor/static/src/js/field_ckeditor.js',
            'web_widget_ckeditor/static/src/scss/web_widget_ckeditor.scss',
            'web_widget_ckeditor/static/src/js/field_html_override.js',
        ],
        'web.report_assets_pdf': [
            'web_widget_ckeditor/static/src/scss/web_widget_ckeditor.scss',
        ],
        'web.report_assets_common': [
            'web/static/fonts/fonts.scss',
            'web_widget_ckeditor/static/src/scss/web_widget_ckeditor.scss',
            'web_enterprise/static/fonts/fonts.scss',
        ],
    }

}
