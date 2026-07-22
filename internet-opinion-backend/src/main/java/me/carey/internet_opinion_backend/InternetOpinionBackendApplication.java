package me.carey.internet_opinion_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
@RestController
public class InternetOpinionBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InternetOpinionBackendApplication.class, args);
	}

	@GetMapping("/hello")
	public String getHello() {
		return "OUR FIRST API";
	}

}
