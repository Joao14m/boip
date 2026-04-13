-- V9: migrate purpose values from English to Portuguese
UPDATE cattle_lot_profile SET purpose = 'Corte'      WHERE purpose = 'BEEF';
UPDATE cattle_lot_profile SET purpose = 'Leite'      WHERE purpose = 'DAIRY';
UPDATE cattle_lot_profile SET purpose = 'Reprodução' WHERE purpose = 'BREEDING';
UPDATE cattle_lot_profile SET purpose = 'Misto'      WHERE purpose = 'MIXED';
