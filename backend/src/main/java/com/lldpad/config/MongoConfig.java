package com.lldpad.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Fills {@code @CreatedDate} / {@code @LastModifiedDate} fields and backs {@code @Transactional}.
 * Multi-document transactions need a replica set, which every MongoDB Atlas cluster is.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    MongoTransactionManager transactionManager(MongoDatabaseFactory databaseFactory) {
        return new MongoTransactionManager(databaseFactory);
    }
}
