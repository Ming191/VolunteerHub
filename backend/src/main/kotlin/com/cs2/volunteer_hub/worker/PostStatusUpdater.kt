package com.cs2.volunteer_hub.worker

import com.cs2.volunteer_hub.config.RabbitMQConfig
import com.cs2.volunteer_hub.dto.PostImageUploadFailureMessage
import com.cs2.volunteer_hub.dto.PostImageUploadSuccessMessage
import com.cs2.volunteer_hub.model.ImageStatus
import com.cs2.volunteer_hub.repository.PostRepository
import com.cs2.volunteer_hub.service.ImageUploadService
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class PostStatusUpdater(
    private val postRepository: PostRepository,
    private val imageUploadService: ImageUploadService
) {
    private val logger = LoggerFactory.getLogger(PostStatusUpdater::class.java)

    @RabbitListener(queues = [RabbitMQConfig.POST_IMAGE_UPLOAD_SUCCEEDED_QUEUE])
    @Transactional
    fun handleUploadSuccess(message: PostImageUploadSuccessMessage) {
        val postId = message.postId
        val uploadedUrls = message.uploadedUrls

        logger.info("Processing upload success for Post ID: $postId with ${uploadedUrls.size} images")

        val post = postRepository.findById(postId).orElse(null)
        if (post == null) {
            logger.warn("Post ID: $postId not found for status update. May have been deleted.")
            return
        }

        var updated = false
        uploadedUrls.forEach { (imageId, url) ->
            post.images.find { it.id == imageId }?.let { image ->
                image.url = url
                image.status = ImageStatus.UPLOADED
                updated = true
            }
        }

        if (updated) {
            postRepository.save(post)
            logger.info("Successfully saved image status for Post ID: $postId")
        }
    }

    @RabbitListener(queues = [RabbitMQConfig.POST_IMAGE_UPLOAD_FAILED_QUEUE])
    @Transactional
    fun handleUploadFailure(message: PostImageUploadFailureMessage) {
        val postId = message.postId
        val uploadedUrls = message.uploadedUrls
        val error = message.error

        logger.warn("Processing upload failure for Post ID: $postId. Error: $error")

        // Clean up successfully uploaded files from GCS
        if (uploadedUrls.isNotEmpty()) {
            logger.info("Cleaning up ${uploadedUrls.size} successfully uploaded images from GCS for Post ID: $postId")
            uploadedUrls.values.forEach { url ->
                try {
                    imageUploadService.deleteImageByUrl(url)
                    logger.info("Successfully deleted image from GCS: $url")
                } catch (e: Exception) {
                    logger.error("Failed to delete image from GCS: $url. Error: ${e.message}", e)
                    // Continue cleanup even if one fails
                }
            }
        }

        // Delete post from database
        if (postRepository.existsById(postId)) {
            postRepository.deleteById(postId)
            logger.warn("Deleted Post ID: $postId from database due to upload failure.")
        } else {
            logger.info("Post ID: $postId was already deleted. Skipping compensating action.")
        }
    }
}

