import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_smart_plan(context_data: dict, user_pref: str) -> str:
    """
    Sends the aggregated data to Google Gemini to generate a plan.
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
        You are an intelligent City Assistant for Tunis. 
        Create a detailed, structured itinerary based on the following REAL-TIME data:

        1. 🚍 Mobility Alerts: {context_data.get('mobility')}
        2. 🎭 Events: {context_data.get('events')}
        3. ☁️ Air Quality: {context_data.get('air_quality')}

        👤 User Preferences: "{user_pref}"

        INSTRUCTIONS:
        1. **Analysis**: Briefly mention if Air Quality or Traffic affects the plans.
        2. **The Schedule**: Structure the itinerary clearly. Use a format like:
           - **09:00 AM**: Activity Name (Location) - *Why it fits*
           - **12:00 PM**: Lunch Suggestion
        3. **Logic**:
           - If AQI is Bad (>100), strictly suggest INDOOR activities.
           - If AQI is missing or 0, warn the user that air quality data is unavailable.
           - If Traffic is Delayed, suggest walking or trams away from the jam.
        4. **Formatting**: Use Markdown. Use **Bold** for times and locations. Use Emojis.
        
        Do not output a wall of text. Make it skimmable.
        """

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI Generation Failed: {str(e)}"