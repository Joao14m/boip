package com.boip.backend.validation;

import com.boip.backend.dto.UserPayoutInfoRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

public class PayoutInfoValidator implements ConstraintValidator<ValidPayoutInfo, UserPayoutInfoRequestDto> {

    private static final Set<String> VALID_PIX_KEY_TYPES = Set.of("CPF", "CNPJ", "EMAIL", "PHONE", "EVP");
    private static final Set<String> VALID_ACCOUNT_TYPES = Set.of("CONTA_CORRENTE", "CONTA_POUPANCA");

    @Override
    public boolean isValid(UserPayoutInfoRequestDto dto, ConstraintValidatorContext ctx) {
        if (dto == null || dto.getTransferType() == null) {
            return true; // @NotBlank on transferType handles null/blank
        }

        ctx.disableDefaultConstraintViolation();
        boolean valid = true;

        switch (dto.getTransferType()) {
            case "PIX" -> valid = validatePix(dto, ctx);
            case "TED" -> valid = validateTed(dto, ctx);
            default -> {
                ctx.buildConstraintViolationWithTemplate("must be PIX or TED")
                        .addPropertyNode("transferType")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }

    private boolean validatePix(UserPayoutInfoRequestDto dto, ConstraintValidatorContext ctx) {
        boolean valid = true;

        if (isBlank(dto.getPixKey())) {
            addViolation(ctx, "pixKey", "must not be blank when transferType is PIX");
            valid = false;
        }

        if (isBlank(dto.getPixKeyType())) {
            addViolation(ctx, "pixKeyType", "must not be blank when transferType is PIX");
            valid = false;
        } else if (!VALID_PIX_KEY_TYPES.contains(dto.getPixKeyType())) {
            addViolation(ctx, "pixKeyType", "must be one of: CPF, CNPJ, EMAIL, PHONE, EVP");
            valid = false;
        }

        return valid;
    }

    private boolean validateTed(UserPayoutInfoRequestDto dto, ConstraintValidatorContext ctx) {
        boolean valid = true;

        if (isBlank(dto.getBankCode())) {
            addViolation(ctx, "bankCode", "must not be blank when transferType is TED");
            valid = false;
        }

        if (isBlank(dto.getAgency())) {
            addViolation(ctx, "agency", "must not be blank when transferType is TED");
            valid = false;
        }

        if (isBlank(dto.getAccount())) {
            addViolation(ctx, "account", "must not be blank when transferType is TED");
            valid = false;
        }

        if (isBlank(dto.getAccountDigit())) {
            addViolation(ctx, "accountDigit", "must not be blank when transferType is TED");
            valid = false;
        }

        if (isBlank(dto.getBankAccountType())) {
            addViolation(ctx, "bankAccountType", "must not be blank when transferType is TED");
            valid = false;
        } else if (!VALID_ACCOUNT_TYPES.contains(dto.getBankAccountType())) {
            addViolation(ctx, "bankAccountType", "must be one of: CONTA_CORRENTE, CONTA_POUPANCA");
            valid = false;
        }

        return valid;
    }

    private void addViolation(ConstraintValidatorContext ctx, String field, String message) {
        ctx.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)
                .addConstraintViolation();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
