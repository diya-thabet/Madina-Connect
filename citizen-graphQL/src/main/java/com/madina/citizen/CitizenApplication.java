package com.madina.citizen;

import com.madina.citizen.model.Event;
import com.madina.citizen.model.Report;
import com.madina.citizen.repository.EventRepository;
import com.madina.citizen.repository.ReportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CitizenApplication {

	public static void main(String[] args) {
		SpringApplication.run(CitizenApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(EventRepository eventRepo, ReportRepository reportRepo) {
		return args -> {
			System.out.println("--- INJECTING REAL TUNISIAN CITIZEN DATA ---");

			// 1. Events (Tunis Culture & Tech)
			eventRepo.save(new Event(
					"Festival International de Carthage",
					"The biggest musical event in Africa.",
					"2025-07-15 20:00",
					"Amphithéâtre de Carthage",
					"Culture",
					"Ministry of Culture",
					false
			));

			eventRepo.save(new Event(
					"Tunis Tech Summit 2025",
					"Annual gathering of startups and innovators.",
					"2025-05-20 09:00",
					"Cité de la Culture, Tunis",
					"Technology",
					"Tunis Startups Association",
					true
			));

			eventRepo.save(new Event(
					"Foire Internationale du Livre",
					"Exhibition of books from around the world.",
					"2025-04-25 10:00",
					"Parc des Expositions du Kram",
					"Literature",
					"Ministry of Culture",
					false
			));

			eventRepo.save(new Event(
					"Marathon COMAR",
					"City marathon through Avenue Habib Bourguiba.",
					"2025-10-12 08:00",
					"Centre Ville, Tunis",
					"Sports",
					"COMAR Assurances",
					true
			));

			// 2. Reports (Urban Issues)
			reportRepo.save(new Report(
					"Deep pothole causing traffic slowdown",
					"Rue de Marseille, Tunis",
					"Infrastructure",
					"Ahmed Ben Ali"
			));

			reportRepo.save(new Report(
					"Street lights broken for 3 days",
					"Cité Ennasr 2, near Mosque",
					"Lighting",
					"Sarra Tounsi"
			));

			reportRepo.save(new Report(
					"Trash accumulation on sidewalk",
					"Lafayette, Rue de Palestine",
					"Cleanliness",
					"Karim Jlassi"
			));

			System.out.println("--- CITIZEN DATA INJECTION COMPLETE ---");
		};
	}
}