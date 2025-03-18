# Company Research Intelligence

An AI-powered company research platform that provides comprehensive business intelligence and investment analysis. The platform uses multiple AI agents to gather and analyze information from various sources, providing detailed insights about companies.

## Features

- 🔍 **Multi-Agent Research System**
  - Company Overview Agent
  - Financial Analysis Agent
  - Market Research Agent
  - Competitive Intelligence Agent
  - ROI Analysis Agent

- 📊 **Real-Time Analysis**
  - Live progress tracking
  - Source visualization
  - Dynamic content updates

- 📱 **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Interactive components
  - Markdown rendering

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **AI Integration**: Google Gemini API
- **Search**: Google Custom Search API

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Google Gemini API key
- Google Custom Search API key and Search Engine ID

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hemantsingh443/company-research-bot.git
   cd company-research-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_API_KEY=your_google_api_key
   VITE_GOOGLE_CSE_ID=your_custom_search_engine_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

## Deployment

The project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and:

1. Set up the environment variables in your Vercel project settings
2. Configure the build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Gemini API](https://ai.google.dev/) for AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com) for hosting
