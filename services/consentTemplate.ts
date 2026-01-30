import { ConsentTemplate } from '@/types/consent';
import {
  ACUPUNCTURE_CONSENT,
  ACUPUNCTURE_HEALTH_CHECK_CONSENT,
  HEALTH_CHECK_CONSENT,
  MASSAGE_CONSENT
} from '../constants/consentTemplates';

class ConsentTemplateService {
  // Get active consent templates (now returns hardcoded templates only)
  async getActiveTemplates(): Promise<ConsentTemplate[]> {
    return this.getHardcodedTemplates();
  }

  // Get specific template by ID
  async getTemplate(id: string): Promise<ConsentTemplate | null> {
    const templates = this.getHardcodedTemplates();
    return templates.find(t => t.id === id) || null;
  }

  // Get template by name
  async getTemplateByName(name: string): Promise<ConsentTemplate | null> {
    const templates = this.getHardcodedTemplates();
    return templates.find(t => t.name === name) || null;
  }

  // Get default template
  async getDefaultTemplate(): Promise<ConsentTemplate> {
    const template = await this.getTemplateByName('acupuncture_consent');
    return template || this.getHardcodedTemplates()[0];
  }

  // Get all hardcoded templates
  private getHardcodedTemplates(): ConsentTemplate[] {
    const baseTemplate = {
      isActive: true,
      effectiveFrom: new Date().toISOString(),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return [
      {
        id: 'acupuncture_consent',
        ...ACUPUNCTURE_CONSENT,
        ...baseTemplate,
      },
      {
        id: 'massage_consent',
        ...MASSAGE_CONSENT,
        ...baseTemplate,
      },
      {
        id: 'health_check_consent',
        ...HEALTH_CHECK_CONSENT,
        ...baseTemplate,
      },
      {
        id: 'acupuncture_health_check_consent',
        ...ACUPUNCTURE_HEALTH_CHECK_CONSENT,
        ...baseTemplate,
      },
    ];
  }
}

// Export singleton instance
export const consentTemplateService = new ConsentTemplateService();
