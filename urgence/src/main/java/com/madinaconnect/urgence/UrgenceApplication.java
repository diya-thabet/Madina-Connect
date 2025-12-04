package com.madinaconnect.urgence;

import com.madinaconnect.urgence.model.AlertEntity;
import com.madinaconnect.urgence.model.AlertStatus;
import com.madinaconnect.urgence.repository.AlertRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.Arrays;

@SpringBootApplication
public class UrgenceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrgenceApplication.class, args);
	}

	// This Bean runs automatically when the server starts
	@Bean
	public CommandLineRunner initData(AlertRepository repository) {
		return args -> {
			// 1. Check if data exists. If yes, stop here.
			if (repository.count() > 0) {
				System.out.println("ℹ️ Database already has data. Skipping initialization.");
				return;
			}

			System.out.println("⚠️ Database is empty. Injecting Tunisian context data...");

			// 2. Prepare the Data (Tunis Context)

			// Accident on Route X
			AlertEntity a1 = new AlertEntity(
					null, // ID is auto-generated
					"ACCIDENT",
					"09123456", // CIN
					36.8516, 10.1961,
					"Collision multiple sur la Route X direction Aéroport. Circulation bloquée.",
					AlertStatus.PENDING,
					LocalDateTime.now()
			);

			// Fire at Belvedere
			AlertEntity a2 = new AlertEntity(
					null,
					"FIRE",
					"14567890",
					36.8234, 10.1732,
					"Départ de feu signalé dans la zone boisée du Parc du Belvédère.",
					AlertStatus.IN_PROGRESS,
					LocalDateTime.now()
			);

			// Medical at Bourguiba
			AlertEntity a3 = new AlertEntity(
					null,
					"MEDICAL",
					"07889900",
					36.8008, 10.1800,
					"Malaise cardiaque devant le Théâtre Municipal. Ambulance demandée.",
					AlertStatus.RESOLVED,
					LocalDateTime.now().minusHours(2)
			);

			// Flood in Ariana
			AlertEntity a4 = new AlertEntity(
					null,
					"ACCIDENT",
					"11223344",
					36.8625, 10.1956,
					"Inondation majeure au rond-point de l'Escale, Ariana.",
					AlertStatus.PENDING,
					LocalDateTime.now()
			);

			// False Alarm in Lac 2
			AlertEntity a5 = new AlertEntity(
					null,
					"FIRE",
					"05667788",
					36.8442, 10.2699,
					"Odeur de gaz suspecte signalée près de Tunisia Mall. Fausse alerte.",
					AlertStatus.CANCELLED,
					LocalDateTime.now().minusHours(4)
			);

			// 3. Save everything to Database
			repository.saveAll(Arrays.asList(a1, a2, a3, a4, a5));

			System.out.println("✅ Fake Tunisian Data Injected Successfully!");
		};
	}
}