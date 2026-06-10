import google.generativeai as genai
from app.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Using gemini-1.5-flash as the standard fast and capable model
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.model = None

    def generate_recommendation(self, score: float, user_name: str) -> str:
        """
        Generates a personalized recommendation based on a student's score.
        If GEMINI_API_KEY is not configured, falls back to pre-defined rules.
        """
        # Determine score category and basic text
        if score < 40:
            category = "Beginner"
            fallback_text = (
                f"Focus on fundamental concepts. We recommend restarting with introductory tutorials, "
                f"interactive practice problems, and reading foundation docs."
            )
        elif score <= 70:
            category = "Intermediate"
            fallback_text = (
                f"You have a solid foundation but have room to grow. We recommend studying intermediate topics, "
                f"building small projects, and focusing on the areas where you missed questions."
            )
        else:
            category = "Advanced"
            fallback_text = (
                f"Excellent work! You have mastered the fundamentals. We recommend challenging yourself with "
                f"advanced system architecture, deep-dive articles, and contributing to open-source or complex projects."
            )

        if not self.model:
            # Fallback when API key is not configured
            return (
                f"### Category: {category} (Score: {score:.1f}%)\n\n"
                f"Hello {user_name}! Based on your score, here is your recommendation:\n\n"
                f"**Recommendation:** {fallback_text}\n\n"
                f"*(Note: Set the GEMINI_API_KEY in your .env file to generate fully customized AI roadmaps!)*"
            )

        try:
            prompt = (
                f"You are an AI Personalized Learning Coach. A student named '{user_name}' took a quiz and scored {score:.1f}%.\n"
                f"This score falls into the '{category}' category (<40 Beginner, 40-70 Intermediate, >70 Advanced).\n\n"
                f"Please generate a personalized learning roadmap. Format your response in clean Markdown with:\n"
                f"1. An encouraging opening statement referencing their score ({score:.1f}%) and category ({category}).\n"
                f"2. 3-4 specific topic areas they should focus on next.\n"
                f"3. Suggested learning resources (e.g. documentation, tutorials) and study exercises tailored to their level.\n"
                f"4. Next actionable milestone/step.\n\n"
                f"Keep the recommendation concrete, structured, and limited to 250-300 words."
            )
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return (
                f"### Category: {category} (Score: {score:.1f}%)\n\n"
                f"Hello {user_name}! Based on your score, here is your recommendation:\n\n"
                f"**Recommendation:** {fallback_text}\n\n"
                f"*(AI Generation failed: {str(e)})*"
            )

    def chat_tutor(self, message: str, user_name: str) -> str:
        """
        Interacts with the student as an AI Tutor.
        If GEMINI_API_KEY is not configured, falls back to a template response.
        """
        if not self.model:
            return (
                f"Hello {user_name}! I am your AI Personalized Learning Tutor.\n\n"
                f"Currently, my Gemini AI brain is in offline mode (missing GEMINI_API_KEY). "
                f"However, I received your query: \"{message}\"\n\n"
                f"Please add your `GEMINI_API_KEY` to the `.env` file to enable real-time interactive tutor replies!"
            )

        try:
            prompt = (
                f"You are a friendly, encouraging, and expert AI Tutor. A student named '{user_name}' is asking you "
                f"a learning question. Provide a clear, educational, and structured explanation of the concepts "
                f"involved. Break down complex points, use analogies if helpful, and suggest a follow-up question or practice exercise "
                f"to help them solidify their understanding.\n\n"
                f"Student's Question: {message}\n\n"
                f"Tutor Response:"
            )
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return (
                f"Hello {user_name}! I encountered an error while processing your request with Gemini:\n\n"
                f"Error details: {str(e)}"
            )

# Create singleton instance
gemini_service = GeminiService()

