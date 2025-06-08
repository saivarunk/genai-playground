import { Marp } from '@marp-team/marp-core';

export interface PresentationSlide {
  title: string;
  content: string[];
  notes?: string;
}

export interface PresentationData {
  title: string;
  author?: string;
  theme?: string;
  slides: PresentationSlide[];
}

export class PresentationGenerator {
  private marp: Marp;

  constructor() {
    this.marp = new Marp({
      html: true,
    });
  }

  generateMarkdown(presentation: PresentationData): string {
    let markdown = '';
    
    // Marp frontmatter
    markdown += `---\n`;
    markdown += `theme: default\n`;
    markdown += `paginate: true\n`;
    markdown += `---\n\n`;
    
    // Title slide
    markdown += `# ${presentation.title}\n\n`;
    if (presentation.author) {
      markdown += `**Author:** ${presentation.author}\n\n`;
    }
    markdown += `*Created with Jarvis AI*\n\n`;
    
    // Content slides
    presentation.slides.forEach((slide) => {
      markdown += `---\n\n`;
      markdown += `# ${slide.title}\n\n`;
      
      slide.content.forEach((item) => {
        markdown += `- ${item}\n`;
      });
      
      markdown += `\n`;
      
      if (slide.notes) {
        markdown += `<!-- ${slide.notes} -->\n\n`;
      }
    });
    
    return markdown;
  }

  async generatePresentation(presentation: PresentationData): Promise<{
    markdown: string;
    html: string;
    css: string;
  }> {
    const markdown = this.generateMarkdown(presentation);
    const { html, css } = this.marp.render(markdown);
    
    return {
      markdown,
      html,
      css,
    };
  }

  async renderMarpitMarkdown(markdown: string): Promise<{
    markdown: string;
    html: string;
    css: string;
  }> {
    const { html, css } = this.marp.render(markdown);
    
    return {
      markdown,
      html,
      css,
    };
  }

  // Helper method to parse AI-generated presentation content
  static parsePresentationFromText(text: string): PresentationData | null {
    try {
      // Clean up the text - remove code blocks and extra formatting
      let cleanText = text;
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```markdown\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // Remove any leading/trailing whitespace and dashes
      cleanText = cleanText.replace(/^-+\s*/gm, '');
      cleanText = cleanText.trim();
      
      const lines = cleanText.split('\n').filter(line => line.trim());
      const slides: PresentationSlide[] = [];
      let currentSlide: PresentationSlide | null = null;
      let title = 'AI Generated Presentation';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and YAML frontmatter
        if (!trimmed || trimmed === '---' || trimmed.startsWith('paginate:') || 
            trimmed.startsWith('theme:') || trimmed.startsWith('<!--')) {
          continue;
        }
        
        // Check for YAML title
        if (trimmed.startsWith('title:')) {
          title = trimmed.replace('title:', '').trim();
          continue;
        }
        
        // Check for presentation title
        if (trimmed.toLowerCase().includes('presentation:') || 
            (trimmed.toLowerCase().includes('title:') && !trimmed.startsWith('title:'))) {
          title = trimmed.split(':')[1]?.trim() || title;
          continue;
        }
        
        // Check for slide titles (## or numbered)
        if (trimmed.startsWith('##') || /^\d+\./.test(trimmed)) {
          // Save previous slide
          if (currentSlide) {
            slides.push(currentSlide);
          }
          
          // Create new slide
          const slideTitle = trimmed.replace(/^(##|\d+\.)/, '').trim();
          currentSlide = {
            title: slideTitle,
            content: [],
          };
        }
        // Check for bullet points or content
        else if ((trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) && currentSlide) {
          const content = trimmed.replace(/^(-|•|\*)/, '').trim();
          if (content) {
            currentSlide.content.push(content);
          }
        }
        // Regular content lines (non-formatting)
        else if (trimmed.length > 0 && currentSlide && 
                 !trimmed.includes('**') && 
                 !trimmed.startsWith('#') &&
                 !trimmed.includes('```')) {
          currentSlide.content.push(trimmed);
        }
      }
      
      // Add the last slide
      if (currentSlide) {
        slides.push(currentSlide);
      }
      
      // Only return if we found at least one slide
      if (slides.length === 0) {
        return null;
      }
      
      return {
        title,
        slides,
        author: 'Jarvis AI',
      };
    } catch (error) {
      console.error('Error parsing presentation:', error);
      return null;
    }
  }
}

export const presentationGenerator = new PresentationGenerator(); 