package com.futureteachai;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

/**
 * Azure Functions with HTTP Trigger.
 */
public class MakePdf {
    /**
     * This function listens at endpoint "/api/MakePdf".
     * Invoke it using "curl" command in bash:
     * curl -d "HTTP Body" {your host}/api/MakePdf
     */
    @FunctionName("MakePdf")
    public HttpResponseMessage run(
        @HttpTrigger(
            name = "req",
            methods = {HttpMethod.POST},
            authLevel = AuthorizationLevel.ANONYMOUS
        ) HttpRequestMessage<String> request,
        final ExecutionContext context) {

        try {
            // Get the questions from the request body
            String questionsString = request.getBody();

            // Generate the PDF bytes
            byte[] pdfBytes = generatePdf(questionsString);

            // Return the PDF as the response
            return request.createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/pdf")
                    .body(pdfBytes)
                    .build();
        } catch (Exception e) {
            // Handle exceptions and return an error response
            return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating PDF: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Generates a PDF document from a string containing questions.
     * @param questionsString The string containing questions.
     * @return PDF document as byte array.
     */
    public static byte[] generatePdf(String questionsString) {
        String[] questions = questionsString.split(","); // Adjust based on your JSON format

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                for (String question : questions) {
                    contentStream.newLine();
                    contentStream.showText(question);
                }
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}