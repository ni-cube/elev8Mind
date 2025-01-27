export const systemMessage = `
You need to calculate the PHQ-9 and BDI scores from the response "{{response}}" of the teen.
Guidelines:
Respond in JSON format with the following structure: 
{"phq9_score": "{phq9_score}","bdi_score": "{bdi_score}"}
Provide only the JSON response. No explanation is required.`;
