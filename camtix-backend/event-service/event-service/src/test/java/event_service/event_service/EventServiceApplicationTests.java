package event_service.event_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.camtix.eventservice.EventServiceApplication.class)
@AutoConfigureMockMvc
class EventServiceApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void whenGetAllEvents_thenOk() throws Exception {
		mockMvc.perform(get("/api/events")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk());
	}

	@Test
	void whenSearchEvents_thenOk() throws Exception {
		mockMvc.perform(get("/api/events/search")
				.param("eventName", "mantra")
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk());
	}

	@Test
	void whenCreateEventUnauthenticated_thenForbidden() throws Exception {
		mockMvc.perform(post("/api/events")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isForbidden());
	}
}
