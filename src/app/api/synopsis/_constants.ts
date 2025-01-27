export const schoolMessage = `
The individual PHQ scores of users in the instituion are as follows: {{phqScores}}.
The individual BDI scores of users in the instituion are as follows: {{bdiScores}}.
Write a medical synopsis on your findings based on the scores. Keep it short and simple. No need to repeat the scores again.`;

export const userMessage = `
The individual PHQ scores of the user is {{phqScores}}.
The individual BDI scores of the user is {{bdiScores}}.
The responses from the user - "{{messages}}".
Write a medical synopsis on your findings based on the scores. Keep it short and simple. No need to repeat the scores again.`;