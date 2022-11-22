
{
    "name": "CKEditor",
    "summary": "",
    "version": "15",
    "website": "www.snit.sa",
    "category": "Web",
    "author": "snit",
    "depends": ["web_editor"],
    # "data": ["templates/assets.xml"],
    'assets': {
        'web.assets_backend': [
            'web_widget_ckeditor/static/lib/ckeditor/build/ckeditor.js',
            # 'web_widget_ckeditor/static/src/js/lineheight.min.js',
            'web_widget_ckeditor/static/src/js/field_ckeditor.js',
            'web_widget_ckeditor/static/src/scss/web_widget_ckeditor.scss',
            'web_widget_ckeditor/static/src/js/field_html_override.js',
        ]

    }

}
