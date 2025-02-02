export const systemMessage = `
You need to calculate the PHQ-9 and BDI scores and the PHQ-9 score breakdown into the categories ("confused", "hopelessness", "exhausted", "disconnected", "angry", "despair") from the response "{{response}}" of the teen.
Guidelines:
Respond in JSON format with the following structure: 
1. Respond in JSON format with the following structure: {"phq9_score": "{phq9_score}","bdi_score": "{bdi_score}", "phq9_categories": {"confused": "{confused}", "hopelessness": "{hopelessness}", "exhausted": "{exhausted}", "disconnected": "{disconnected}", "angry": "{angry}", "despair": "{despair}"}}.
Provide only the JSON response. No explanation is required.`;
