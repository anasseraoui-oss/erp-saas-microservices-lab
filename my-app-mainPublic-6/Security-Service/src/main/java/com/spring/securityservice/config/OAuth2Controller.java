package com.spring.securityservice.config;

import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class OAuth2Controller {

    /**
     * This endpoint is automatically called by Spring Security after a successful authentication with Google.
     * Its job is to capture the authorization tokens and redirect the user back to the frontend.
     */
    @GetMapping("/login/success")
    public RedirectView getLoginInfo(
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient,
            @AuthenticationPrincipal OAuth2User oauth2User) {

        // Here you can access the tokens and save them to your database, associated with the current user.
        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        String refreshToken = authorizedClient.getRefreshToken() != null ? authorizedClient.getRefreshToken().getTokenValue() : null;

        // Get user info thanks to "email" and "profile" scopes
        String userEmail = oauth2User.getAttribute("email");
        String userName = oauth2User.getAttribute("name");

        // Example:
        // 1. Use userEmail to find the user in your database.
        // 2. Save the accessToken and refreshToken for that user.

        System.out.println("User " + userName + " (" + userEmail + ") connected successfully to Google Drive!");

        // Redirect the user back to the settings page in the React app with a success flag.
        return new RedirectView("http://localhost:3003/settings?google_drive_connected=true");
    }

    @GetMapping("/login/failure")
    public RedirectView getLoginFailure() {
        // Redirect the user back with an error flag.
        return new RedirectView("http://localhost:3003/settings?google_drive_connected=false&error=true");
    }
}