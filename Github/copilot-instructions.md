## Project Overview

Cycora is an interactive prototype built using Twine that explores circular economy systems through decision-making gameplay.

The experience presents users with waste materials and asks them to choose how to reuse, discard, or transform them. Each decision affects environmental impact indicators.

The goal is to create an intuitive interactive system that demonstrates circular transformation processes.


## Coding Style

Follow these principles when generating code:

* Keep code simple and readable
* Use clear variable names
* Use consistent naming conventions
* Avoid overly complex logic
* Prioritize clarity over optimization


## Twine Structure Guidelines

The Twine project should follow this structure:

Start Passage
→ Material Encounter Passage
→ Decision Options
→ Outcome Passages
→ Indicator Updates
→ Next Scenario

Each decision should lead to a unique outcome passage.


## Variable System

Use variables to track environmental impact.

Examples:

waste_score
resource_score
impact_score

Each decision modifies these values.

Example logic:

discard option → increases waste_score
compost option → increases impact_score
reuse option → increases resource_score


## Interaction Design

Each interaction should include:

* material description
* decision options
* transformation result
* updated impact indicators

Users should clearly see the consequences of their choices.


## UI Expectations

The interface should:

* be minimal and readable
* include clear buttons or links for decisions
* display environmental indicators
* use simple visual feedback


## Development Goal

The generated code should create a working Twine prototype demonstrating:

* branching narrative decisions
* circular transformation scenarios
* environmental impact indicators
