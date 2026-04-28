# build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn -q -DskipTests package
RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# run stage
FROM eclipse-temurin:21-jre-alpine AS run
WORKDIR /app
COPY --from=build /app/target/extracted/dependencies/ ./
COPY --from=build /app/target/extracted/spring-boot-loader/ ./
COPY --from=build /app/target/extracted/snapshot-dependencies/ ./
COPY --from=build /app/target/extracted/application/ ./
RUN addgroup -S app && adduser -S -u 1000 -G app app && chown -R app:app /app
USER app
EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
