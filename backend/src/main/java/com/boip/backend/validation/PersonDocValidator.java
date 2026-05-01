package com.boip.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PersonDocValidator
        implements ConstraintValidator<ValidPersonDoc, PersonDocHolder> {

    @Override
    public boolean isValid(PersonDocHolder value, ConstraintValidatorContext ctx) {
        if (value == null) return true;

        String doc  = value.getPersonDoc();
        String type = value.getDocType();

        // PATCH case: both absent → nothing to validate
        if (doc == null && type == null) return true;

        ctx.disableDefaultConstraintViolation();

        // Partial PATCH: exactly one is null
        if (doc == null || type == null) {
            String missing = (doc == null) ? "personDoc" : "docType";
            ctx.buildConstraintViolationWithTemplate(
                    "personDoc and docType must both be provided or both be absent")
               .addPropertyNode(missing)
               .addConstraintViolation();
            return false;
        }

        return switch (type) {
            case "CPF"  -> validateCpf(doc, ctx);
            case "CNPJ" -> validateCnpj(doc, ctx);
            default -> {
                ctx.buildConstraintViolationWithTemplate("docType must be CPF or CNPJ")
                   .addPropertyNode("docType")
                   .addConstraintViolation();
                yield false;
            }
        };
    }

    // CPF: 11 digits, not all-same, two modulo-11 check digits
    private boolean validateCpf(String doc, ConstraintValidatorContext ctx) {
        if (!doc.matches("\\d{11}")) {
            addViolation(ctx, "CPF must be exactly 11 digits");
            return false;
        }
        if (isAllSame(doc)) {
            addViolation(ctx, "Invalid CPF");
            return false;
        }

        int[] d = digits(doc);

        int sum = 0;
        for (int i = 0; i < 9; i++) sum += d[i] * (10 - i);
        int r1 = sum % 11;
        if ((r1 < 2 ? 0 : 11 - r1) != d[9]) {
            addViolation(ctx, "Invalid CPF");
            return false;
        }

        sum = 0;
        for (int i = 0; i < 10; i++) sum += d[i] * (11 - i);
        int r2 = sum % 11;
        if ((r2 < 2 ? 0 : 11 - r2) != d[10]) {
            addViolation(ctx, "Invalid CPF");
            return false;
        }

        return true;
    }

    // CNPJ: 14 digits, not all-same, two modulo-11 check digits
    private boolean validateCnpj(String doc, ConstraintValidatorContext ctx) {
        if (!doc.matches("\\d{14}")) {
            addViolation(ctx, "CNPJ must be exactly 14 digits");
            return false;
        }
        if (isAllSame(doc)) {
            addViolation(ctx, "Invalid CNPJ");
            return false;
        }

        int[] d = digits(doc);
        int[] w1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] w2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++) sum += d[i] * w1[i];
        int r1 = sum % 11;
        if ((r1 < 2 ? 0 : 11 - r1) != d[12]) {
            addViolation(ctx, "Invalid CNPJ");
            return false;
        }

        sum = 0;
        for (int i = 0; i < 13; i++) sum += d[i] * w2[i];
        int r2 = sum % 11;
        if ((r2 < 2 ? 0 : 11 - r2) != d[13]) {
            addViolation(ctx, "Invalid CNPJ");
            return false;
        }

        return true;
    }

    private void addViolation(ConstraintValidatorContext ctx, String msg) {
        ctx.buildConstraintViolationWithTemplate(msg)
           .addPropertyNode("personDoc")
           .addConstraintViolation();
    }

    private static int[] digits(String s) {
        int[] d = new int[s.length()];
        for (int i = 0; i < s.length(); i++) d[i] = s.charAt(i) - '0';
        return d;
    }

    private static boolean isAllSame(String s) {
        char c = s.charAt(0);
        for (int i = 1; i < s.length(); i++) if (s.charAt(i) != c) return false;
        return true;
    }
}
