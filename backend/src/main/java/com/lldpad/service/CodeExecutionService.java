package com.lldpad.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lldpad.config.AppProperties;
import com.lldpad.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/** Executes code through the Piston API (https://github.com/engineer-man/piston). */
@Service
public class CodeExecutionService {

    private record LanguageConfig(String language, String version) {}

    private static final Map<String, LanguageConfig> LANGUAGE_MAP = Map.of(
            "cpp", new LanguageConfig("cpp", "10.2.0"),
            "c", new LanguageConfig("c", "10.2.0"),
            "python", new LanguageConfig("python", "3.10.0"),
            "java", new LanguageConfig("java", "15.0.2"),
            "javascript", new LanguageConfig("javascript", "18.15.0"),
            "typescript", new LanguageConfig("typescript", "5.0.0"),
            "csharp", new LanguageConfig("csharp", "6.12.0"),
            "go", new LanguageConfig("go", "1.16.2"),
            "rust", new LanguageConfig("rust", "1.68.2")
    );

    private record PistonFile(String content) {}

    private record PistonRequest(String language, String version, List<PistonFile> files, String stdin) {}

    private record PistonStage(String stdout, String stderr, String output, Integer code) {}

    private record PistonResponse(PistonStage run, PistonStage compile) {}

    /** Combined program output, plus the compiler's stderr when compilation failed. */
    public record Outcome(String output, String compileError) {}

    /** Raised when Piston itself returns a non-2xx response. */
    public static class PistonException extends RuntimeException {
        private final int status;
        private final String statusText;

        PistonException(int status, String statusText, String body) {
            super(body);
            this.status = status;
            this.statusText = statusText;
        }

        public int getStatus() { return status; }
        public String getStatusText() { return statusText; }
    }

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String pistonApiUrl;

    public CodeExecutionService(RestClient.Builder builder, ObjectMapper objectMapper, AppProperties props) {
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
        this.pistonApiUrl = props.pistonApiUrl();
    }

    public void requireSupported(String language) {
        if (!LANGUAGE_MAP.containsKey(language)) {
            throw ApiException.badRequest("Language " + language + " is not supported");
        }
    }

    public Outcome execute(String code, String language, String stdin) {
        requireSupported(language);
        LanguageConfig lang = LANGUAGE_MAP.get(language);
        PistonRequest request = new PistonRequest(lang.language(), lang.version(),
                List.of(new PistonFile(code)), stdin == null ? "" : stdin);

        // Serialized up front so the request carries a Content-Length instead of a chunked body.
        byte[] payload;
        try {
            payload = objectMapper.writeValueAsBytes(request);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize Piston request", e);
        }

        PistonResponse data = restClient.post()
                .uri(pistonApiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .contentLength(payload.length)
                .body(payload)
                .exchange((req, res) -> {
                    if (res.getStatusCode().isError()) {
                        String body = new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8);
                        HttpStatus status = HttpStatus.resolve(res.getStatusCode().value());
                        throw new PistonException(res.getStatusCode().value(),
                                status != null ? status.getReasonPhrase() : "", body);
                    }
                    return res.bodyTo(PistonResponse.class);
                });

        String output = "";
        if (data != null && data.run() != null) {
            PistonStage run = data.run();
            if (notEmpty(run.stdout())) {
                output += run.stdout();
            }
            if (notEmpty(run.stderr())) {
                output += (output.isEmpty() ? "" : "\n") + run.stderr();
            }
            if (notEmpty(run.output()) && output.isBlank()) {
                output = run.output();
            }
            if (run.code() != null && run.code() != 0 && output.isEmpty()) {
                output = "Process exited with code " + run.code();
            }
        }

        String compileError = data != null && data.compile() != null && notEmpty(data.compile().stderr())
                ? data.compile().stderr()
                : null;
        return new Outcome(output, compileError);
    }

    private static boolean notEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}
