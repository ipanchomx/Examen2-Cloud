const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2020-08-01',
    authenticator: new IamAuthenticator({
      apikey: process.env.apiKey,
    }),
    serviceUrl: process.env.url
  });

  
exports.handler = async (event) => {
    let { historial_clinico } = event;

    const analyzeParams = {
        "features": {
            "entities": {
                "emotion": true,
                "sentiment": true,
                "concepts":true,
                "mentions": true,
                "limit": 5
            },
            "keywords": {
                "emotion": true,
                "sentiment": true,
                "limit": 5
            }
        },
        "text": historial_clinico
    };
    
    try {
        let analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams);

        let palabras_clave = analysisResults.result.keywords.map((element) => { 
            return element.text;
        });
        let entidades = analysisResults.result.entities.map((element) => { 
            return element.text;
        });
        let palabras_clave_desc = {};
        analysisResults.result.keywords.forEach((element) => {
            palabras_clave_desc[element.text] = {
                "sentimiento" : element.sentiment.label,
                "relevancia" : element.relevance,
                "repeticiones": element.count,
                "emocion" : element.emotion
            }
        });
        
        let entidades_desc = {};
        analysisResults.result.entities.forEach((element) => {
            entidades_desc[element.text] = {
                "tipo" : element.type,
                "sentimiento" : element.sentiment,
                "relevancia" : element.relevance,
                "repeticiones" : element.count,
                "porcentaje_confianza" : element.confidence,
                "emocion" : element.emotion
            }
        });



        return {     
            "lenguaje_text": analysisResults.result.language,
            "palabras_clave" : palabras_clave,
            "entidades" : entidades,
            "palabras_clave_desc" : palabras_clave_desc,
            "entidades_desc" : entidades_desc,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
    
};
