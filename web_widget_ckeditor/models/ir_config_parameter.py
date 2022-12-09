
from odoo import api, models, fields


class ResCompany(models.Model):

    _inherit = 'res.company'

    deactivate_report_font = fields.Boolean(string='DeActivate Report Fonts?')


    def write(self, vals):
        res = super(ResCompany, self).write(vals)
        if 'deactivate_report_font' in vals:
            for rec in self:
                rec._update_asset_style()
        return res



class IrConfigParameter(models.Model):
    _inherit = "ir.config_parameter"

    @api.model
    def get_web_widget_ckeditor_config(self):
        get_param = self.sudo().get_param
        return {
            "toolbar": get_param("web_widget_ckeditor.toolbar"),
        }

class BaseDocumentLayout(models.TransientModel):
    """
    Customise the company document layout and display a live preview
    """

    _inherit = 'base.document.layout'

    deactivate_report_font = fields.Boolean(related='company_id.deactivate_report_font', readonly=False)


class ResConfigSettings(models.TransientModel):

    _inherit = 'res.config.settings'

    deactivate_report_font = fields.Boolean(related="company_id.deactivate_report_font", readonly=False)
