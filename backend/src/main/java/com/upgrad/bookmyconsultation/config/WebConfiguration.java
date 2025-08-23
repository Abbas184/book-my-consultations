package com.upgrad.bookmyconsultation.config;

import com.upgrad.bookmyconsultation.servlet.AuthFilter;
import com.upgrad.bookmyconsultation.servlet.CorsFilter;
import com.upgrad.bookmyconsultation.servlet.RequestContextFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan("com.upgrad.bookmyconsultation.controller")
//@ServletComponentScan("com.upgrad.bookmyconsultation.servlet") // Keep commented out if using FilterRegistrationBean
public class WebConfiguration {

	// Inject the AuthFilter bean managed by Spring
	@Autowired
	private AuthFilter authFilter;

	@Bean
	public FilterRegistrationBean<AuthFilter> authFilterRegistration() {
		FilterRegistrationBean<AuthFilter> registration = new FilterRegistrationBean<>();
		registration.setFilter(authFilter); // Use the autowired filter instance

		// --- IMPORTANT: Specify ONLY the URL patterns that REQUIRE authentication ---
		// registration.addUrlPatterns("/*"); // REMOVED: This blocked Swagger UI

		// Add patterns for your protected API endpoints below.
		// Examples (Adjust these based on your actual controller mappings):
		registration.addUrlPatterns("/appointments/*");
		registration.addUrlPatterns("/ratings"); // Assuming POST /ratings needs auth
		// registration.addUrlPatterns("/users/{userId}"); // If accessing specific user requires auth
		// registration.addUrlPatterns("/doctors/register"); // If only admins can register doctors
		// *** DO NOT add paths like /users/register, /users/login, /doctors (if public listing) ***
		// *** DO NOT add Swagger paths: /swagger-ui.html, /v2/api-docs, /swagger-resources/*, /webjars/* ***

		registration.setName("Auth Filter");
		registration.setOrder(3); // Run AuthFilter after Cors and RequestContext
		return registration;
	}

	@Bean
	public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
		FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>();
		registration.setFilter(new CorsFilter()); // Create a new instance
		registration.addUrlPatterns("/*"); // Apply CORS to all paths
		registration.setName("Cors Filter");
		registration.setOrder(0); // Run CORS filter first
		return registration;
	}


	@Bean
	public FilterRegistrationBean<RequestContextFilter> reqContextFilterRegistration() {
		FilterRegistrationBean<RequestContextFilter> registration = new FilterRegistrationBean<>();
		registration.setFilter(new RequestContextFilter()); // Create a new instance
		registration.addUrlPatterns("/*"); // Apply RequestContext to all paths
		registration.setName("reqContext Filter");
		registration.setOrder(1); // Run after CORS, before Auth
		return registration;
	}
}