# FormForge v0.3.0 Feature Guide

## 🎨 Using the New Theming System

### Accessing Theme Settings
1. Open your form in the Builder
2. Click the "Form" tab in the right sidebar
3. Scroll to "Form Appearance" section

### Available Themes

#### Default Theme
- Primary Color: Blue (#3b82f6)
- Best for: General purpose forms
- Style: Clean and professional

#### Minimal Theme
- Primary Color: Black (#000000)
- Best for: Sleek, modern forms
- Style: High contrast, simple

#### Modern Theme
- Primary Color: Purple (#8b5cf6)
- Best for: Creative, contemporary forms
- Style: Vibrant and engaging

#### Playful Theme
- Primary Color: Amber (#f59e0b)
- Best for: Fun, casual forms
- Style: Warm and inviting

#### Professional Theme
- Primary Color: Dark Blue (#1e40af)
- Best for: Corporate, business forms
- Style: Trustworthy and formal

### Layout Options

**Single Column** (Default)
- One field per row
- Best for: Short forms, mobile-first design
- Max width: 672px

**Two Column**
- Fields can be side-by-side
- Best for: Longer forms, desktop users
- Max width: 1024px

**Card Style**
- Form in a bordered card
- Best for: Standalone forms, embedding
- Adds visual separation

### Branding Options

**Logo Upload**
- Add your company logo
- Appears at top of form
- Recommended size: 200x48px
- Formats: PNG, JPG, SVG

**Remove Branding**
- Hides "Powered by FormForge" footer
- Available in Pro plan
- Professional appearance

**Progress Bar**
- Shows completion percentage
- Works best with multi-page forms
- Helps reduce abandonment

---

## 🎯 Advanced Field Types

### Matrix Questions

**Use Case:** Multi-dimensional ratings

**Example:** Product satisfaction survey
```
Question: Rate our services
Rows: Customer Service, Product Quality, Delivery Speed
Columns: Poor, Fair, Good, Excellent
```

**How to Add:**
1. Click "Advanced" in field palette
2. Select "Matrix"
3. Configure rows (questions)
4. Configure columns (rating options)

**Best Practices:**
- Keep rows under 10 for usability
- Use 3-7 columns for ratings
- Make column labels clear and consistent

### Ranking Fields

**Use Case:** Preference ordering

**Example:** Feature prioritization
```
Question: Rank these features by importance
Options:
- Dark mode
- Mobile app
- Email notifications
- Advanced search
```

**How to Add:**
1. Click "Advanced" → "Ranking"
2. Add 3-10 options
3. Users drag to reorder

**Best Practices:**
- 3-7 items work best
- Use for prioritization, not simple selection
- Clear instructions help users

### Picture Choice

**Use Case:** Visual selection

**Example:** Product selection, design feedback
```
Question: Choose your favorite design
Images: [design-a.png, design-b.png, design-c.png]
```

**How to Add:**
1. Click "Advanced" → "Picture Choice"
2. Upload images (or provide URLs)
3. Add labels for each image

**Best Practices:**
- Use consistent image sizes
- Optimize images (<500KB each)
- 2-6 options work best
- Clear labels under images

### Signature Field

**Use Case:** Agreements, approvals

**Example:** Terms acceptance, document signing
```
Question: Sign to accept terms
[Signature pad with clear button]
```

**How to Add:**
1. Click "Advanced" → "Signature"
2. Set as required if needed
3. Signature saved as image data

**Best Practices:**
- Place at end of form
- Combine with consent checkbox
- Make it required for legal forms
- Add clear instructions

### Page Breaks

**Use Case:** Multi-page forms

**Example:** Long application forms
```
Page 1: Personal Information
[Page Break]
Page 2: Contact Details
[Page Break]
Page 3: Additional Information
```

**How to Add:**
1. Click "Layout" → "Page Break"
2. Drag to position between sections
3. Enable "Show Progress Bar" in settings

**Best Practices:**
- Group related fields together
- Don't break mid-section
- Use progress bar for long forms
- 3-5 pages maximum recommended

---

## 🎨 Theme Customization Tips

### Choosing Colors

**Primary Color** - Used for buttons, focus states, links
- Should have good contrast with white
- Test on both light and dark backgrounds
- Brand color recommended

**Background Color**
- White or very light colors work best
- Avoid pure black (use dark gray instead)
- Consider readability

**Text Color**
- Dark gray (#1f2937) better than pure black
- Ensure WCAG AA contrast ratio (4.5:1)
- Test with your background

### Font Selection

**Best Web-Safe Fonts:**
- Inter - Modern, clean
- System UI - Fast, native feel
- IBM Plex Sans - Professional
- Quicksand - Playful, friendly

**Tips:**
- Stick to 1-2 fonts
- Ensure font is web-available
- Consider loading time
- Test on mobile

### Button Styles

**Rounded** (Default)
- Modern, friendly
- Good for most forms

**Square**
- Minimal, professional
- Good for corporate forms

**Pill**
- Playful, modern
- Good for casual forms

---

## 📋 Form Layout Strategies

### Single Column
**Best For:**
- Contact forms
- Newsletter signups
- Mobile-first designs
- Simple forms (<10 fields)

**Tips:**
- Stack all fields vertically
- Use dividers to group sections
- Add whitespace between groups

### Two Column
**Best For:**
- Registration forms
- Applications
- Surveys with many fields
- Desktop-focused forms

**Tips:**
- Put related fields side-by-side
- Keep labels aligned
- Test responsive behavior
- Name + Email side-by-side works well

### Card Style
**Best For:**
- Embedded forms
- Pop-up forms
- Standalone pages
- Forms needing visual emphasis

**Tips:**
- Works well on colored backgrounds
- Adds professional polish
- Great for landing pages
- Combines well with shadows

---

## 🔧 Conditional Logic with New Fields

### Matrix Conditions
```
Show "Follow-up question" 
IF Matrix row "Customer Service" = "Poor"
```

### Ranking Conditions
```
Show "Why is this your top choice?"
IF Ranking position 1 = "Feature X"
```

### Picture Choice Conditions
```
Show "Customization options"
IF Picture Choice = "Design A"
```

---

## 💡 Form Design Best Practices

### Color Accessibility
- Use contrast checker tools
- Test with color blindness simulators
- Don't rely solely on color
- Add text labels and icons

### Mobile Optimization
- Single column works best
- Large touch targets (44px min)
- Test on actual devices
- Avoid horizontal scrolling

### Loading Performance
- Optimize images
- Limit custom fonts
- Minimize custom CSS
- Use lazy loading for images

### User Experience
- Clear progress indication
- Save and resume option
- Inline validation
- Thank you message

---

## 🚀 Quick Recipes

### Professional Contact Form
```yaml
Theme: Professional
Layout: Single Column
Fields:
  - Name (text, required)
  - Email (email, required)
  - Company (text)
  - Message (longtext, required)
Settings:
  - Add company logo
  - Remove branding
  - Custom thank you message
```

### Customer Satisfaction Survey
```yaml
Theme: Modern
Layout: Single Column
Fields:
  - Matrix: Service ratings
  - Rating: Overall satisfaction (1-5 stars)
  - Ranking: Most important factors
  - Longtext: Additional comments
Settings:
  - Progress bar enabled
  - Multiple page breaks
  - Redirect to thank you page
```

### Visual Product Selector
```yaml
Theme: Playful
Layout: Card
Fields:
  - Picture Choice: Product selection
  - Conditional: Size options (if product selected)
  - Conditional: Color options (if product selected)
  - Email: Send receipt
Settings:
  - Custom background color
  - Logo at top
  - Webhook to inventory system
```

### Multi-Page Application
```yaml
Theme: Default
Layout: Two Column (desktop), Single (mobile)
Structure:
  Page 1: Personal Info
    - Name, Email, Phone
  [Page Break]
  Page 2: Address
    - Street, City, State, Zip
  [Page Break]
  Page 3: Preferences
    - Matrix: Interests
    - Ranking: Priorities
  [Page Break]
  Page 4: Signature
    - Terms checkbox
    - Signature field
Settings:
  - Progress bar enabled
  - Save partial submissions
  - Email notification on submit
```

---

## 🎓 Learning Path

### Beginner
1. Start with Default theme
2. Use Basic fields only
3. Single column layout
4. Practice with 3-5 field forms

### Intermediate
5. Experiment with different themes
6. Try two-column layout
7. Add conditional logic
8. Use Choice fields (checkbox, radio, dropdown)

### Advanced
9. Create multi-page forms
10. Use Matrix and Ranking fields
11. Implement Picture Choice
12. Custom theme configuration
13. Add signature fields
14. Complex conditional logic

---

## 📞 Support & Resources

### Documentation
- README.md - Installation & setup
- CHANGELOG.md - Version history
- IMPLEMENTATION_SUMMARY.md - Technical details

### Community
- GitHub Issues - Bug reports
- Discussions - Feature requests
- Examples - Sample forms

### Next Steps
- Try each new field type
- Experiment with themes
- Build a sample form
- Share feedback

---

*Happy form building! 🚀*
