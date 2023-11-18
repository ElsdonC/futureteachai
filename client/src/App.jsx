import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import OpenAI from 'openai';

    const openai_api = process.env.REACT_APP_OPENAI_API_KEY
    const openai = new OpenAI({ apiKey: `${openai_api}`, dangerouslyAllowBrowser: true });
    
function App() {
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const endpoint = process.env.REACT_APP_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.REACT_APP_DOCUMENT_INTELLIGENCE_KEY;
    const modelID = "prebuilt-document";

    const handleFileSubmit = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await fetch(
                "https://futureteachai.azurewebsites.net/api/ProcessPdf",
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (response.ok) {
                setUploadStatus("File uploaded successfully");
                const pdfUrl = await response.text();
                analyze(pdfUrl);
            } else {
                const errorMessage = await response.text();
                setUploadStatus(`Failed to upload file: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("Error uploading file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const analyze = async (documentUrl) => {
        try {
            setAnalyzing(true);
            const apiUrl = `${endpoint}/formrecognizer/documentModels/${modelID}:analyze?api-version=2023-07-31`;

            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Ocp-Apim-Subscription-Key", key);

            const requestBody = JSON.stringify({ urlSource: documentUrl });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: requestBody,
            });

            if (response.ok) {
                const resultId = response.headers.get("Operation-Location");
                setTimeout(() => fetchAnalysisResult(resultId), 5000);
            } else {
                console.error(
                    "Failed to start document analysis. HTTP status:",
                    response.status
                );
            }
        } catch (error) {
            console.error("Could not analyze file", error);
        }
    };

 // Function to perform OpenAI processing
const processWithOpenAI = async (contentText) => {
    try {
        // Preprocess the contentText to remove line breaks and special characters
        const cleanedContentText = contentText.replace(/(\r\n|\n|\r)/gm, " ").replace(/[^a-zA-Z0-9\s]/g, "");
        console.log("Cleaned Content Text:", cleanedContentText);

        // Generate similar questions for each question
        const questions = contentText.split(/\d+\./).filter(Boolean);
        const generatedQuestions = await Promise.all(questions.map(async (question, index) => {
            const openAIResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You're a teacher that's making new exam questions. Based on the concept being tested in this question, generate another question that tests the same concept" },
                    { role: "user", content: question },
                ],
                temperature: 0.8,
            });

            return openAIResponse.choices[0].message['content'];
        }));

        // Do something with the generated questions
        console.log("Generated Questions:", generatedQuestions);

        return cleanedContentText;
    } catch (error) {
        console.error("Error processing with OpenAI", error);
        throw error;
    }
};

// Modify your fetchAnalysisResult function
const fetchAnalysisResult = async (resultId) => {
    try {
        const apiUrl = resultId;
        const headers = new Headers();
        headers.append("Ocp-Apim-Subscription-Key", key);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: headers,
        });

        if (response.ok) {
            const result = await response.json();

            // Extract and display "content" text
            const contentText = result.analyzeResult.content;
            console.log("Content Text:", contentText);

            // Process with OpenAI
            const processedResult = await processWithOpenAI(contentText);

            // Set analysis results
            setAnalysisResults(processedResult);
        } else {
            console.error(
                "Failed to fetch analysis result. HTTP status:",
                response.status
            );
        }
    } catch (error) {
        console.error("Error analyzing file", error);
    } finally {
        setAnalyzing(false);
    }
};


    return (
        <>
            <FileUpload onFileSubmit={handleFileSubmit} />
            {loading && <p>Uploading...</p>}
            {uploadStatus && <p>{uploadStatus}</p>}
            {analyzing && <p>Analyzing...</p>}
            {analysisResults && <p>Analysis: {analysisResults}</p>}
        </>
    );
}

export default App;
