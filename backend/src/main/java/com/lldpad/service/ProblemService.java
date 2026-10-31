package com.lldpad.service;

import com.lldpad.entity.Problem;
import com.lldpad.repository.ProblemRepository;
import com.lldpad.service.ProblemCatalog.CatalogProblem;
import com.lldpad.service.ProblemCatalog.Example;
import com.lldpad.web.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemCatalog catalog;

    public ProblemService(ProblemRepository problemRepository, ProblemCatalog catalog) {
        this.problemRepository = problemRepository;
        this.catalog = catalog;
    }

    /** Returns the database problem for a slug, seeding it from the catalog on first use. */
    public Problem getOrCreateBySlug(String slug) {
        return problemRepository.findBySlug(slug).orElseGet(() -> create(slug));
    }

    private Problem create(String slug) {
        CatalogProblem source = catalog.find(slug)
                .orElseThrow(() -> ApiException.notFound("Problem with slug \"" + slug + "\" not found"));

        List<String> inputCases = new ArrayList<>(source.examples().stream().map(Example::input).toList());
        List<String> outputCases = new ArrayList<>(source.examples().stream().map(Example::output).toList());
        while (inputCases.size() < 4) {
            inputCases.add(inputCases.isEmpty() ? "test input" : inputCases.getLast());
            outputCases.add(outputCases.isEmpty() ? "test output" : outputCases.getLast());
        }

        Problem problem = new Problem();
        problem.setSlug(source.slug());
        problem.setTitle(source.title());
        problem.setDifficulty(source.difficulty());
        problem.setDescription(source.description());
        problem.setInputCases(List.copyOf(inputCases.subList(0, Math.min(5, inputCases.size()))));
        problem.setOutputCases(List.copyOf(outputCases.subList(0, Math.min(5, outputCases.size()))));

        try {
            return problemRepository.save(problem);
        } catch (DataIntegrityViolationException e) {
            // Another request seeded the same slug concurrently.
            return problemRepository.findBySlug(slug).orElseThrow(() -> e);
        }
    }
}
