// http://localhost:3000/api/demo/blocking

import { generateText } from "ai"
import { google } from '@ai-sdk/google';

export async function POST() {

    const response = await generateText({
        model: google('gemini-2.5-flash-lite'),
        prompt: 'what is 2+2 ?',
        experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,
            recordOutputs: true,
        },
    });

    return  Response.json({response})
}