package com.snapfit.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SnapfitBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SnapfitBackendApplication.class, args);
	}

}
