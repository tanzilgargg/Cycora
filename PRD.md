# PRD – Cycora Circular Transformation Decision System

## Project Overview
Cycora is an interactive UX and game design project that teaches users about the circular economy through decision making. Instead of reading about sustainability, users experience how materials can move through cycles of reuse and transformation.

This PRD documents the core interaction system where users make decisions about how to reuse everyday waste materials and receive feedback about environmental impact.

The system will be implemented as an interactive prototype using Twine.


## Problem
Many sustainability apps present information through static screens or educational content. While users may understand the information, they often do not feel engaged with the system.

Cycora aims to solve this by allowing users to experiment with choices and observe the consequences of their actions.


## Goal
Create a decision-based interaction system where users:

- encounter a material (ex: orange peel)
- choose how to handle it
- observe the environmental impact of that decision
- see how materials can move through circular systems

The interaction should help users understand that waste can be transformed into valuable resources.


## User Scenario

Example interaction:

User receives a material:
Orange peel from cooking.

The system presents options:

1. Throw it away
2. Compost it
3. Turn it into natural dye

Each option leads to a different path.

Throw Away  
→ waste increases  
→ resource value lost  

Compost  
→ soil health improves  
→ moderate environmental benefit  

Natural Dye  
→ textile dye created  
→ high circular reuse impact  

The system then updates impact indicators.


## Core Features

### Material Encounter
Users are presented with a waste material.

Example materials:
- orange peel
- coffee grounds
- vegetable scraps


### Decision Options
Users choose between multiple actions.

Example actions:
- discard
- compost
- reuse
- transform into new material


### Impact Indicators
After each decision, the system updates indicators such as:

- Waste Reduction
- Resource Recovery
- Community Impact
- Environmental Health

These indicators help users visualize the consequences of their actions.


## Interaction Flow

1. User encounters waste material
2. User selects an action
3. System shows transformation process
4. Impact indicators update
5. New material or scenario appears


## Interface Requirements

The interface should include:

- clear choice buttons
- simple visual feedback
- indicators for environmental impact
- minimal text explanation

The experience should feel exploratory and intuitive.


## Technical Requirements

Platform: Twine

Structure:
- branching narrative system
- decision nodes
- impact variables

Example variables:

waste_score  
resource_score  
impact_score  

Each user decision modifies these variables.


## Constraints

- Must run as a browser-based Twine prototype
- Interaction must be understandable without instructions
- System should focus on learning through decision making


## Success Criteria

The system is successful if:

- users understand how materials can be reused
- users feel motivated to explore multiple outcomes
- users can clearly see how decisions affect the system


## Future Extensions

Possible additions:

- more materials
- transformation animations
- expanded circular economy scenarios
- visual dashboards for impact indicators


## Refllection
Writing the PRD really helped me nail down the interaction system in my project, instead of trying to wrap my head around the whole experience at once. By breaking the mechanic into sections, it became much easier to see how all the decisions, variables, and feedback loops fit together. Also, it highlighted how documenting ideas down on paper can turn design concepts into something that can actually be built.