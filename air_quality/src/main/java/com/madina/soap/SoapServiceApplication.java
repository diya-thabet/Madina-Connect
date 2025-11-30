package com.madina.soap;

import com.madina.soap.model.AirData;
import com.madina.soap.repository.AirRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

@SpringBootApplication
@EnableWs
public class SoapServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SoapServiceApplication.class, args);
	}

	// --- 1. SOAP Configuration ---
	@Bean
	public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(ApplicationContext applicationContext) {
		MessageDispatcherServlet servlet = new MessageDispatcherServlet();
		servlet.setApplicationContext(applicationContext);
		servlet.setTransformWsdlLocations(true);
		return new ServletRegistrationBean<>(servlet, "/ws/*");
	}

	@Bean(name = "airQuality")
	public DefaultWsdl11Definition defaultWsdl11Definition(XsdSchema airQualitySchema) {
		DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
		wsdl11Definition.setPortTypeName("AirQualityPort");
		wsdl11Definition.setLocationUri("/ws");
		wsdl11Definition.setTargetNamespace("http://madina.com/soap/airquality");
		wsdl11Definition.setSchema(airQualitySchema);
		return wsdl11Definition;
	}

	@Bean
	public XsdSchema airQualitySchema() {
		return new SimpleXsdSchema(new ClassPathResource("air-quality.xsd"));
	}

	// --- 2. Data Injection (Tunisian Context) ---
	@Bean
	public CommandLineRunner initData(AirRepository repository) {
		return args -> {
			repository.save(new AirData("Tunis-Centre", 85, "Moderate", 45.0, 22.5, 65.0, 420.0, 35.5));
			repository.save(new AirData("Sfax-Industrial", 158, "Unhealthy", 85.0, 60.2, 120.5, 450.0, 40.1));
			repository.save(new AirData("Carthage", 25, "Good", 12.0, 5.5, 10.1, 405.0, 25.0));
			repository.save(new AirData("Gabes", 140, "Unhealthy for Sensitive Groups", 70.0, 50.0, 95.0, 440.0, 38.0));
			repository.save(new AirData("Bizerte", 50, "Good", 25.0, 12.0, 18.0, 410.0, 30.0));
			System.out.println("--- TUNISIAN AIR QUALITY DATA LOADED ---");
		};
	}
}