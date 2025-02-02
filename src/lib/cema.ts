import { phq9 } from "@/data/phq9";

interface Symptom {
  id: string,
  keywords: { 
    categories: string[][] 
  } 
}

/**
 * Represents a symptom selection, indicating which symptom was covered and the keywords associated with it.
 */

interface SymptomSelection {
  symptomCovered: string, 
  keywords: string[]
}
const emotions = phq9;

/**
 * Finds the first symptom linked to a given emotion ID.
 * Throws an error if no matching symptom is found.
 * @param emotionId 
 * @returns 
 */
export function getSymptomfromEmotionId(emotionId: string): Symptom {
  const emotion = emotions.find(prompt => prompt.id === emotionId);
  if(emotion) return emotion.symptoms[0];
  else throw new Error(`Symptom with id ${emotionId} not found`);
}

/**
 * 
 * @param symptomsCovered 
 * @returns Returns the categories of the second-to-last symptom from a list of symptoms already covered.
 * Handles the case where there is only one symptom covered by falling back to the last symptom.
 */
export function getCategoryOf2ndLastSymptomsCovered(symptomsCovered: string[]): string[] {
  console.log("symptomsCovered=" + symptomsCovered);
  return getCategoryFromSymptomCoveredId(symptomsCovered[symptomsCovered.length-((symptomsCovered.length>1)?2:1)]);
}

/**
 * Determines the category (_L for low severity, _H for high severity) of a symptom based on its ID.
 * Strips _L or _H from the symptom ID to locate the base symptom and returns the corresponding category.
 * Note - SymptomCovedId are the ones ending with _L or _H e.g. Mood_L, Mood_H
 * @param symptomId 
 * @returns 
 */
function getCategoryFromSymptomCoveredId(symptomId: string): string[] {
  const symptom = emotions
    .flatMap(prompt => prompt.symptoms)
    .find(symptom => symptom.id === symptomId.replace("_L", "").replace("_H", ""));
  ;
  if (symptom) {
    return (symptomId.indexOf("_L")!=-1)?symptom.keywords.categories[0]: symptom.keywords.categories[1];
  } else { // error should never happen
    return [symptomId.replace("_L", "").replace("_H", "")];
  }
}

/**
 * Retrieves a symptom object based on its ID.
 * Throws an error if no symptom is found.
 * @param symptomId 
 * @returns 
 */
function getSymptomfromId(symptomId: string): Symptom {
  const symptom = emotions
    .flatMap(prompt => prompt.symptoms)
    .find(symptom => symptom.id === symptomId);
  ;
  if(symptom) return symptom;
  else throw new Error(`Symptom with id ${symptomId} not found`);
}

/**
 * Determines keywords for a symptom based on severity.
 * Returns:
 *  Low-severity keywords (_L) if the symptom has not been covered yet.
 *  High-severity keywords (_H) if it has been covered once.
 *  null if the symptom has already been fully covered (both _L and _H).
 * @param symptomId 
 * @param severity 
 * @param symptomsCovered 
 * @returns 
 */
function getKeywordsForCurrentSymptom(
    symptomId: string,
    symptomsCovered: string[]): SymptomSelection|null {
      const count:number = symptomsCovered.filter(s => (s.indexOf(symptomId)!=-1)).length;
      if (count==2 ) {
        return null;
      } else if(count==1) {
        return {symptomCovered: symptomId + "_H", keywords: getSymptomfromId(symptomId).keywords.categories[1]};
      } else {
        return {symptomCovered: symptomId + "_L", keywords: getSymptomfromId(symptomId).keywords.categories[0]};
      }
      // if(severity>2) {
      //   return {symptomCovered: symptomId + "_H", keywords: getSymptomfromId(symptomId).keywords.categories[1]};
      // } else {
      //   return {symptomCovered: symptomId + "_L", keywords: getSymptomfromId(symptomId).keywords.categories[0]};
      // }
}

/**
 * Checks if a specific symptom ID is part of a given symptom list.
 * @param symtoms 
 * @param symptomId 
 * @returns 
 */
function isIdInSymptoms(symtoms:Symptom[], symptomId: string): boolean {
  return(symtoms.filter(symptom => symptom.id.indexOf(symptomId)!=-1).length>0);
}

/**
 * Finds the next uncovered symptom in the same emotional context based on a given symptom ID.
 * @param symptomId 
 * @returns 
 */
function getNextSymptomInEmotion(symptomId: string): Symptom | null{
  // find all symptoms corresponding to symptomId
  const symptoms = emotions.filter(prompt => isIdInSymptoms(prompt.symptoms, symptomId)).flatMap(prompt => prompt.symptoms);  
  // from the symptoms above find the first symptom that is not covered
  const symptom = symptoms.find(symptom => symptom.id.indexOf(symptomId)==-1);
  return(symptom)?symptom:null;
}

/**
 * Returns all available symptom IDs by flattening the list of emotions and their symptoms.
 * @returns Returns all symptom IDs from the emotional prompts.
 */
function getAllSymptomIds():string[] {
  return(emotions.flatMap(prompt => prompt.symptoms.map(symptom => symptom.id)));
}

/**
 * Identifies the next symptom not yet covered outside the current emotional context.
 * Subtracts covered symptoms from all available symptom IDs and returns the first uncovered symptom.
 * @param symptomsCovered 
 * @returns 
 */
function getNextSymptomOutsideEmotion(symptomsCovered: string[]): Symptom | null{
  // A =  getAllSymptomIds(); B = symptomsCovered; A-B
  const symptomsAvailable:string[] =  getAllSymptomIds().filter(symptomId => symptomsCovered.filter(s => (s.indexOf(symptomId)!=-1)).length==0);
  return (symptomsAvailable.length>0)?getSymptomfromId(symptomsAvailable[0]):null;
}

/**
 * If currentSymptomId is empty, starts with the first covered symptom.
 * Checks if the current symptom has keywords left to offer.
 * If not, moves to the next symptom in the same emotional context.
 * If no symptoms are left in the current context, moves to the next uncovered symptom outside the current emotion.
 * Ends when all symptoms and keywords are exhausted, returning END.
 * @param currentSymptomId 
 * @param severity // TODO will come from ML in the future
 * @param symptomsCovered 
 * @returns 
 */
export function getKeywords(
    currentSymptomId: string,
    symptomsCovered: string[]): SymptomSelection{ 
      if(currentSymptomId=="") {
        currentSymptomId = symptomsCovered[0];
      }
      if(symptomsCovered.find(s => s.indexOf("Suicidal_H")!=-1)) {
        return {symptomCovered: "END", keywords: []};
      }
      let keywords = getKeywordsForCurrentSymptom(currentSymptomId, symptomsCovered);
      if(keywords) {
        return keywords
      } else {
        let symptom = getNextSymptomInEmotion(currentSymptomId);
        if(symptom!=null) {
          keywords = getKeywordsForCurrentSymptom(symptom.id, symptomsCovered);
          if(keywords) {
            return keywords;
          } // else all categories for the symptom are accounted 
            // continue to next symptom
        }
        symptom = getNextSymptomOutsideEmotion(symptomsCovered);
        if(symptom!=null) {
          return getKeywords(symptom.id, symptomsCovered);
        } else {
          return {symptomCovered: "END", keywords: []};
        }
      }
}
