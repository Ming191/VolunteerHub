package com.cs2.volunteer_hub.controller

import com.cs2.volunteer_hub.model.Interest
import com.cs2.volunteer_hub.model.Skill
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/enums")
@Tag(name = "Enums", description = "Get available enum values for dropdowns and selections")
class EnumController {

    @Operation(
        summary = "Get all available skills",
        description = "Returns all skill enum values that users can select for their profile"
    )
    @GetMapping("/skills", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSkills(): ResponseEntity<List<SkillInfo>> {
        val skills = Skill.entries.map { skill ->
            SkillInfo(
                value = skill.name,
                label = skill.name.replace('_', ' ').lowercase()
                    .split(' ')
                    .joinToString(" ") { word ->
                        word.replaceFirstChar { it.uppercase() }
                    }
            )
        }.sortedBy { it.label }

        return ResponseEntity.ok(skills)
    }

    @Operation(
        summary = "Get all available interests",
        description = "Returns all interest enum values that users can select for their profile"
    )
    @GetMapping("/interests", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getInterests(): ResponseEntity<List<InterestInfo>> {
        val interests = Interest.entries.map { interest ->
            InterestInfo(
                value = interest.name,
                label = interest.name.replace('_', ' ').lowercase()
                    .split(' ')
                    .joinToString(" ") { word ->
                        word.replaceFirstChar { it.uppercase() }
                    }
            )
        }.sortedBy { it.label }

        return ResponseEntity.ok(interests)
    }

    @Operation(
        summary = "Get skills grouped by category",
        description = "Returns skills organized by their functional categories"
    )
    @GetMapping("/skills/grouped", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getSkillsGrouped(): ResponseEntity<Map<String, List<SkillInfo>>> {
        val grouped = mapOf(
            "Communication & Interpersonal" to listOf(
                Skill.PUBLIC_SPEAKING, Skill.COMMUNICATION, Skill.ACTIVE_LISTENING,
                Skill.PRESENTATION, Skill.WRITING, Skill.TRANSLATION, Skill.SIGN_LANGUAGE
            ),
            "Leadership & Management" to listOf(
                Skill.LEADERSHIP, Skill.TEAM_MANAGEMENT, Skill.PROJECT_MANAGEMENT,
                Skill.EVENT_PLANNING, Skill.COORDINATION, Skill.PROBLEM_SOLVING,
                Skill.DECISION_MAKING, Skill.CONFLICT_RESOLUTION
            ),
            "Teaching & Mentoring" to listOf(
                Skill.TEACHING, Skill.TUTORING, Skill.MENTORING, Skill.COACHING,
                Skill.TRAINING, Skill.CURRICULUM_DEVELOPMENT, Skill.CHILD_CARE
            ),
            "Healthcare & Wellness" to listOf(
                Skill.FIRST_AID, Skill.CPR, Skill.NURSING, Skill.COUNSELING,
                Skill.MENTAL_HEALTH_SUPPORT, Skill.PHYSICAL_THERAPY, Skill.NUTRITION,
                Skill.YOGA_INSTRUCTION
            ),
            "Technical & IT" to listOf(
                Skill.WEB_DEVELOPMENT, Skill.MOBILE_APP_DEVELOPMENT, Skill.GRAPHIC_DESIGN,
                Skill.VIDEO_EDITING, Skill.PHOTOGRAPHY, Skill.SOCIAL_MEDIA_MANAGEMENT,
                Skill.DATA_ANALYSIS, Skill.DATABASE_MANAGEMENT, Skill.IT_SUPPORT
            ),
            "Creative & Arts" to listOf(
                Skill.MUSIC, Skill.PAINTING, Skill.DRAWING, Skill.CRAFTS,
                Skill.PERFORMING_ARTS, Skill.DANCE, Skill.DRAMA, Skill.CREATIVE_WRITING
            ),
            "Construction & Manual" to listOf(
                Skill.CARPENTRY, Skill.PLUMBING, Skill.ELECTRICAL_WORK, Skill.PAINTING_DECORATING,
                Skill.GARDENING, Skill.LANDSCAPING, Skill.MECHANICAL_REPAIR, Skill.CONSTRUCTION
            ),
            "Administrative & Business" to listOf(
                Skill.ADMINISTRATIVE_SUPPORT, Skill.DATA_ENTRY, Skill.BOOKKEEPING,
                Skill.ACCOUNTING, Skill.FUNDRAISING, Skill.GRANT_WRITING, Skill.MARKETING,
                Skill.SALES, Skill.CUSTOMER_SERVICE, Skill.LEGAL_ADVICE
            ),
            "Other Skills" to listOf(
                Skill.COOKING, Skill.ANIMAL_CARE, Skill.DRIVING, Skill.RESEARCH,
                Skill.SPORTS_COACHING, Skill.FITNESS_TRAINING
            )
        ).mapValues { (_, skills) ->
            skills.map { skill ->
                SkillInfo(
                    value = skill.name,
                    label = skill.name.replace('_', ' ').lowercase()
                        .split(' ')
                        .joinToString(" ") { word -> word.replaceFirstChar { it.uppercase() } }
                )
            }
        }

        return ResponseEntity.ok(grouped)
    }

    @Operation(
        summary = "Get interests grouped by category",
        description = "Returns interests organized by cause area"
    )
    @GetMapping("/interests/grouped", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getInterestsGrouped(): ResponseEntity<Map<String, List<InterestInfo>>> {
        val grouped = mapOf(
            "Social Causes" to listOf(
                Interest.POVERTY_ALLEVIATION, Interest.HOMELESSNESS, Interest.HUNGER_RELIEF,
                Interest.AFFORDABLE_HOUSING, Interest.SOCIAL_JUSTICE, Interest.HUMAN_RIGHTS,
                Interest.REFUGEE_SUPPORT, Interest.IMMIGRATION
            ),
            "Education & Youth" to listOf(
                Interest.EDUCATION, Interest.YOUTH_DEVELOPMENT, Interest.LITERACY,
                Interest.AFTER_SCHOOL_PROGRAMS, Interest.MENTORSHIP, Interest.SCHOLARSHIP_PROGRAMS
            ),
            "Health & Wellness" to listOf(
                Interest.HEALTHCARE, Interest.MENTAL_HEALTH, Interest.DISABILITY_SUPPORT,
                Interest.ELDERLY_CARE, Interest.PUBLIC_HEALTH, Interest.FITNESS_WELLNESS
            ),
            "Environment & Sustainability" to listOf(
                Interest.ENVIRONMENTAL_CONSERVATION, Interest.CLIMATE_CHANGE, Interest.RECYCLING,
                Interest.RENEWABLE_ENERGY, Interest.WILDLIFE_PROTECTION, Interest.OCEAN_CONSERVATION
            ),
            "Animals" to listOf(
                Interest.ANIMAL_WELFARE, Interest.ANIMAL_RESCUE, Interest.PET_ADOPTION,
                Interest.WILDLIFE_REHABILITATION
            ),
            "Community & Culture" to listOf(
                Interest.COMMUNITY_BUILDING, Interest.ARTS_CULTURE, Interest.NEIGHBORHOOD_IMPROVEMENT,
                Interest.CULTURAL_PRESERVATION, Interest.CIVIC_ENGAGEMENT
            ),
            "Special Populations" to listOf(
                Interest.CHILD_WELFARE, Interest.SENIOR_SERVICES, Interest.WOMENS_RIGHTS,
                Interest.VETERANS_SUPPORT, Interest.LGBTQ_RIGHTS
            ),
            "Emergency & Disaster" to listOf(
                Interest.DISASTER_RELIEF, Interest.EMERGENCY_RESPONSE, Interest.HUMANITARIAN_AID
            )
        ).mapValues { (_, interests) ->
            interests.map { interest ->
                InterestInfo(
                    value = interest.name,
                    label = interest.name.replace('_', ' ').lowercase()
                        .split(' ')
                        .joinToString(" ") { word -> word.replaceFirstChar { it.uppercase() } }
                )
            }
        }

        return ResponseEntity.ok(grouped)
    }
}

data class SkillInfo(
    val value: String,
    val label: String
)

data class InterestInfo(
    val value: String,
    val label: String
)

