package com.lldpad.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** The hardcoded problem set, loaded from {@code problems.json} on the classpath. */
@Service
public class ProblemCatalog {

    public record Example(String input, String output, String explanation) {}

    public record CatalogProblem(int id, String title, List<String> companies, String designPattern,
                                 String difficulty, String slug, String description, List<Example> examples) {}

    private final Map<String, CatalogProblem> bySlug = new LinkedHashMap<>();

    public ProblemCatalog(ObjectMapper objectMapper) {
        try (InputStream in = new ClassPathResource("problems.json").getInputStream()) {
            List<CatalogProblem> problems = objectMapper.readValue(in, new TypeReference<>() {});
            problems.stream()
                    .sorted(Comparator.comparingInt(CatalogProblem::id))
                    .forEach(p -> bySlug.put(p.slug(), p));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load problems.json", e);
        }
    }

    public List<CatalogProblem> all() {
        return List.copyOf(bySlug.values());
    }

    public Optional<CatalogProblem> find(String slug) {
        return Optional.ofNullable(bySlug.get(slug));
    }
}
