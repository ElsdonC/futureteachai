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
     * This function listens at endpoint "/api/MakePdf". Two ways to invoke it using
     * "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/MakePdf
     * 2. curl {your host}/api/MakePdf?name=HTTP%20Query
     */
    @FunctionName("MakePdf")
    public HttpResponseMessage run(
        @HttpTrigger(name = "req", methods = {HttpMethod.POST}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<String> request,
        final ExecutionContext context) {
        
        String[] questions = request.getBody().split(","); // Adjust based on your JSON format

        byte[] pdfBytes = generatePdf(questions);

        return request.createResponseBuilder(HttpStatus.OK)
                .header("Content-Type", "application/pdf")
                .body(pdfBytes)
                .build();
    }

    public static byte[] generatePdf(String[] questions) {
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
