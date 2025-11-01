package com.spring.securityservice.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/drive")
public class DriveUploadController {

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPdf(
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "folderId", required = false) String folderId) throws IOException {

        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            return ResponseEntity.status(401).body("No Google OAuth client authorized");
        }

        String accessToken = authorizedClient.getAccessToken().getTokenValue();

        String metadata;
        if (folderId != null && !folderId.isEmpty()) {
            metadata = "{\"name\":\"" + file.getOriginalFilename() + "\",\"parents\":[\"" + folderId + "\"]}";
        } else {
            metadata = "{\"name\":\"" + file.getOriginalFilename() + "\"}";
        }
        String boundary = "-------314159265358979323846";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.parseMediaType("multipart/related; boundary=" + boundary));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String part1 = "--" + boundary + "\r\n" +
                "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                metadata + "\r\n";
        out.write(part1.getBytes(StandardCharsets.UTF_8));

        String part2Header = "--" + boundary + "\r\n" +
                "Content-Type: " + (file.getContentType() == null ? "application/pdf" : file.getContentType()) + "\r\n\r\n";
        out.write(part2Header.getBytes(StandardCharsets.UTF_8));
        out.write(file.getBytes());
        out.write(("\r\n--" + boundary + "--").getBytes(StandardCharsets.UTF_8));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(out.toByteArray(), headers);

        String url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink";
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> resp = rt.postForEntity(url, requestEntity, String.class);

        return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
    }

    @GetMapping("/folders")
    public ResponseEntity<String> listFolders(@RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient) {
        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            return ResponseEntity.status(401).body("No Google OAuth client authorized");
        }

        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Accept", "application/json");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        String url = "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)&pageSize=200";
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> resp = rt.exchange(url, HttpMethod.GET, entity, String.class);
        return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
    }
}
