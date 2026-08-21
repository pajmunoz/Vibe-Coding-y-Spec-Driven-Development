# Requirements Document

## Introduction

This document defines the requirements for a Shoe Repair Quotation feature. The feature enables customers to receive cost estimates for shoe repair services by selecting their shoe type, describing the damage, and choosing from available repair services. The system generates an itemized quotation that the customer can review, accept, or discard. The goal is to provide a transparent, self-service pricing experience for both walk-in and online customers.

## Glossary

- **Customer**: An end user who submits a shoe repair request and receives a quotation.
- **Quotation**: A cost estimate document generated for a specific set of repair services applied to a specific shoe type.
- **Repair_Service**: A defined repair operation offered by the shop (e.g., sole replacement, heel repair, stitching).
- **Shoe_Type**: A classification of footwear (e.g., sneaker, dress shoe, boot, sandal, high heel).
- **Service_Catalog**: The collection of available Repair_Services, each with a name, description, and base price.
- **Quotation_Engine**: The system component responsible for calculating the total cost of a quotation based on selected services and shoe type.
- **Price_Modifier**: A multiplier applied to a base price based on shoe type complexity or material. Valid values are in the range (0, 100].
- **Quotation_Item**: A single line in a quotation representing one Repair_Service with its applicable price.
- **Admin**: A shop staff member who manages the Service_Catalog and Price_Modifier configurations.
- **Active**: A Repair_Service status indicating it is enabled and available for selection in quotation requests.

---

## Requirements

### Requirement 1: Browse the Service Catalog

**User Story:** As a customer, I want to browse the available repair services, so that I can understand what repairs are offered and their base prices before requesting a quotation.

#### Acceptance Criteria

1. THE Quotation_Engine SHALL expose a list of all Repair_Services whose status is active, ordered alphabetically by service name.
2. WHEN a customer requests the service list, THE Quotation_Engine SHALL return each active Repair_Service with its name (1–100 characters), description (1–500 characters), and base price (a numeric value in the range [0.01, 999,999.99] represented with two decimal places).
3. IF the Service_Catalog contains no active Repair_Services, THEN THE Quotation_Engine SHALL return an empty list and a message stating "No repair services are currently available."

---

### Requirement 2: Select Shoe Type and Repair Services

**User Story:** As a customer, I want to select my shoe type and the repair services I need, so that the system can compute a cost estimate tailored to my footwear.

#### Acceptance Criteria

1. WHEN a customer submits a quotation request, THE Quotation_Engine SHALL require at least one Repair_Service identifier and a valid Shoe_Type to be specified.
2. IF a customer submits a quotation request with no Repair_Services selected, THEN THE Quotation_Engine SHALL reject the request and return an error message stating that at least one repair service must be selected.
3. IF a customer submits a quotation request with an unrecognized Shoe_Type, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the unrecognized Shoe_Type value.
4. IF a customer submits a quotation request with an unrecognized Repair_Service identifier, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying each unrecognized Repair_Service identifier.
5. IF a customer submits a quotation request referencing a Repair_Service whose status is inactive, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying each inactive Repair_Service identifier.
6. WHEN a customer selects one or more Repair_Services, THE Quotation_Engine SHALL include each selected service as a separate Quotation_Item in the resulting quotation.

---

### Requirement 3: Generate a Cost Estimate

**User Story:** As a customer, I want to receive an itemized cost estimate, so that I can see the price breakdown for each repair service before committing.

#### Acceptance Criteria

1. WHEN a valid quotation request is submitted, THE Quotation_Engine SHALL compute the final price of each Quotation_Item as: final_price = base_price × applied_modifier, where applied_modifier is the configured Price_Modifier for the specified Shoe_Type and Repair_Service combination, or exactly 1.0 if no such modifier is configured.
2. WHEN a valid quotation request is submitted, THE Quotation_Engine SHALL compute the total cost as the arithmetic sum of all Quotation_Item final prices, rounded to two decimal places using half-up rounding.
3. WHEN a valid quotation request is submitted, THE Quotation_Engine SHALL return a Quotation containing: a unique quotation identifier (UUID v4 format), the Shoe_Type, the list of Quotation_Items (each with service name, base price, applied_modifier, and final price), and the total cost.
4. WHEN a Shoe_Type has no configured Price_Modifier for a given Repair_Service, THE Quotation_Engine SHALL apply a default multiplier of exactly 1.0 to compute the final price.
5. THE Quotation_Engine SHALL represent all monetary values (base price, final price, total cost) using exactly two decimal places, applying half-up rounding where needed.

---

### Requirement 4: Save and Retrieve Quotations

**User Story:** As a customer, I want my quotation to be saved so that I can retrieve it later for review or to share with the shop.

#### Acceptance Criteria

1. WHEN a Quotation is successfully generated, THE Quotation_Engine SHALL persist the Quotation with a unique identifier in UUID v4 format and a creation timestamp in ISO 8601 format.
2. WHEN a customer provides a valid quotation identifier, THE Quotation_Engine SHALL return the full Quotation details including: quotation identifier, Shoe_Type, list of Quotation_Items (each with service name, base price, applied_modifier, and final price), total cost, and creation timestamp.
3. IF a customer provides an invalid or non-existent quotation identifier, THEN THE Quotation_Engine SHALL return an error message identifying the provided identifier and stating it was not found.
4. WHEN a Quotation is persisted, THE Quotation_Engine SHALL store all Quotation_Items, the Shoe_Type, the total cost, and the creation timestamp such that each stored value is byte-for-byte identical to the value present at generation time.

---

### Requirement 5: Manage the Service Catalog

**User Story:** As an admin, I want to create, update, and deactivate repair services in the catalog, so that the available services and prices always reflect what the shop currently offers.

#### Acceptance Criteria

1. WHEN an admin creates a new Repair_Service, THE Quotation_Engine SHALL persist the service with a unique identifier, a name (1–100 characters), a description (1–500 characters), a base price in the range [0.01, 999,999.99], and an active status set to true.
2. WHEN an admin updates an existing Repair_Service, THE Quotation_Engine SHALL apply changes only to the provided fields and preserve unchanged fields.
3. WHEN an admin deactivates a Repair_Service that is currently active, THE Quotation_Engine SHALL set the service status to inactive and exclude it from future quotation requests. IF the Repair_Service is already inactive, THE Quotation_Engine SHALL treat the request as a no-op and return a success response.
4. IF an admin attempts to create a Repair_Service with a base price less than or equal to zero or greater than 999,999.99, THEN THE Quotation_Engine SHALL reject the request and return an error message indicating the valid price range [0.01, 999,999.99].
5. IF an admin attempts to create a Repair_Service with a name that already exists in the Service_Catalog (case-insensitive), THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the duplicate name.
6. IF an admin attempts to update a non-existent Repair_Service, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the provided service identifier as not found.
7. IF an admin attempts to deactivate a non-existent Repair_Service, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the provided service identifier as not found.
8. WHEN a Repair_Service is deactivated, THE Quotation_Engine SHALL retain previously generated Quotations that reference that service without modification.

---

### Requirement 6: Manage Price Modifiers

**User Story:** As an admin, I want to configure price modifiers per shoe type and repair service, so that the quotation reflects the additional complexity or material cost for specific footwear types.

#### Acceptance Criteria

1. WHEN an admin sets a Price_Modifier for a combination of Shoe_Type and Repair_Service, THE Quotation_Engine SHALL persist the multiplier value and apply it in future quotation calculations for that combination.
2. IF an admin sets a Price_Modifier with a value less than or equal to zero or greater than 100, THEN THE Quotation_Engine SHALL reject the configuration and return an error message indicating the valid range (0, 100].
3. IF an admin sets a Price_Modifier referencing an unrecognized Shoe_Type, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the unrecognized Shoe_Type value.
4. IF an admin sets a Price_Modifier referencing an unrecognized Repair_Service identifier, THEN THE Quotation_Engine SHALL reject the request and return an error message identifying the unrecognized Repair_Service identifier.
5. WHEN an admin updates an existing Price_Modifier, THE Quotation_Engine SHALL validate the new multiplier value against the range (0, 100] and, if valid, replace the previous multiplier value for that Shoe_Type and Repair_Service combination.
6. WHEN no Price_Modifier exists for a given Shoe_Type and Repair_Service combination, THE Quotation_Engine SHALL apply a default multiplier of exactly 1.0 to compute the final price.

---

### Requirement 7: Input Validation and Error Handling

**User Story:** As a customer or admin, I want the system to validate all inputs and provide clear error messages, so that I understand what went wrong and how to correct my request.

#### Acceptance Criteria

1. IF a required field is missing from any request, THEN THE Quotation_Engine SHALL return an error message that identifies each missing field by name.
2. IF a monetary value field contains a non-numeric value, THEN THE Quotation_Engine SHALL return an error message that identifies the field name and states that a numeric value is required.
3. IF a Price_Modifier value is provided that is less than or equal to zero or greater than 100, THEN THE Quotation_Engine SHALL reject the request and return an error message indicating the valid range is greater than 0 and less than or equal to 100.
4. WHEN THE Quotation_Engine encounters an unexpected internal error, THE Quotation_Engine SHALL return a generic error response that does not contain stack traces, internal component names, or file paths.
