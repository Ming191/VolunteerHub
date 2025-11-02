package com.cs2.volunteer_hub.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.QueueBuilder
import org.springframework.amqp.core.TopicExchange
import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@EnableRabbit
class RabbitMQConfig {

    companion object {
        const val EXCHANGE_NAME = "event_exchange"

        const val EVENT_CREATION_PENDING_QUEUE = "event_creation_pending_queue"
        const val IMAGE_UPLOAD_SUCCEEDED_QUEUE = "image_upload_succeeded_queue"
        const val IMAGE_UPLOAD_FAILED_QUEUE = "image_upload_failed_queue"

        // Post queues
        const val POST_CREATION_PENDING_QUEUE = "post_creation_pending_queue"
        const val POST_IMAGE_UPLOAD_SUCCEEDED_QUEUE = "post_image_upload_succeeded_queue"
        const val POST_IMAGE_UPLOAD_FAILED_QUEUE = "post_image_upload_failed_queue"

        // Notification queue
        const val NOTIFICATION_QUEUE = "notification_queue"
        const val REGISTRATION_STATUS_UPDATED_QUEUE = "registration_status_updated_queue"

        // Dead Letter Queues
        const val EVENT_CREATION_DLQ = "event_creation_pending_queue.dlq"
        const val IMAGE_UPLOAD_SUCCEEDED_DLQ = "image_upload_succeeded_queue.dlq"
        const val IMAGE_UPLOAD_FAILED_DLQ = "image_upload_failed_queue.dlq"

        const val POST_CREATION_DLQ = "post_creation_pending_queue.dlq"
        const val POST_IMAGE_UPLOAD_SUCCEEDED_DLQ = "post_image_upload_succeeded_queue.dlq"
        const val POST_IMAGE_UPLOAD_FAILED_DLQ = "post_image_upload_failed_queue.dlq"

        const val NOTIFICATION_DLQ = "notification_queue.dlq"
        const val REGISTRATION_STATUS_UPDATED_DLQ = "registration_status_updated_queue.dlq"

        const val EVENT_CREATION_PENDING_ROUTING_KEY = "event.creation.pending"
        const val IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY = "image.upload.succeeded"
        const val IMAGE_UPLOAD_FAILED_ROUTING_KEY = "image.upload.failed"

        const val POST_CREATION_PENDING_ROUTING_KEY = "post.creation.pending"
        const val POST_IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY = "post.image.upload.succeeded"
        const val POST_IMAGE_UPLOAD_FAILED_ROUTING_KEY = "post.image.upload.failed"

        const val NOTIFICATION_ROUTING_KEY = "notification.send"
        const val REGISTRATION_STATUS_UPDATED_ROUTING_KEY = "registration.status.updated"

        const val MAX_RETRY_COUNT = 3
        const val MESSAGE_TTL = 3600000 // 1 hour in milliseconds
    }

    @Bean
    fun messageConverter(): Jackson2JsonMessageConverter {
        return Jackson2JsonMessageConverter()
    }

    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate {
        val template = RabbitTemplate(connectionFactory)
        template.messageConverter = messageConverter()
        return template
    }

    @Bean
    fun rabbitListenerContainerFactory(
        connectionFactory: ConnectionFactory,
        configurer: SimpleRabbitListenerContainerFactoryConfigurer
    ): SimpleRabbitListenerContainerFactory {
        val factory = SimpleRabbitListenerContainerFactory()
        configurer.configure(factory, connectionFactory)
        factory.setMessageConverter(messageConverter())
        factory.setDefaultRequeueRejected(false)
        return factory
    }

    @Bean
    fun eventExchange(): TopicExchange {
        return TopicExchange(EXCHANGE_NAME)
    }

    @Bean
    fun eventCreationPendingQueue(): Queue {
        return QueueBuilder.durable(EVENT_CREATION_PENDING_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", EVENT_CREATION_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun imageUploadSucceededQueue(): Queue {
        return QueueBuilder.durable(IMAGE_UPLOAD_SUCCEEDED_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", IMAGE_UPLOAD_SUCCEEDED_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun imageUploadFailedQueue(): Queue {
        return QueueBuilder.durable(IMAGE_UPLOAD_FAILED_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", IMAGE_UPLOAD_FAILED_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun eventCreationDlq(): Queue {
        return QueueBuilder.durable(EVENT_CREATION_DLQ).build()
    }

    @Bean
    fun imageUploadSucceededDlq(): Queue {
        return QueueBuilder.durable(IMAGE_UPLOAD_SUCCEEDED_DLQ).build()
    }

    @Bean
    fun imageUploadFailedDlq(): Queue {
        return QueueBuilder.durable(IMAGE_UPLOAD_FAILED_DLQ).build()
    }

    // Bindings
    @Bean
    fun bindEventCreationPending(
        @Qualifier("eventCreationPendingQueue") pendingQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(pendingQueue).to(exchange).with(EVENT_CREATION_PENDING_ROUTING_KEY)
    }

    @Bean
    fun bindImageUploadSucceeded(
        @Qualifier("imageUploadSucceededQueue") succeededQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(succeededQueue).to(exchange).with(IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY)
    }

    @Bean
    fun bindImageUploadFailed(
        @Qualifier("imageUploadFailedQueue") failedQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(failedQueue).to(exchange).with(IMAGE_UPLOAD_FAILED_ROUTING_KEY)
    }

    // Post Queues with DLQ configuration
    @Bean
    fun postCreationPendingQueue(): Queue {
        return QueueBuilder.durable(POST_CREATION_PENDING_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", POST_CREATION_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun postImageUploadSucceededQueue(): Queue {
        return QueueBuilder.durable(POST_IMAGE_UPLOAD_SUCCEEDED_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", POST_IMAGE_UPLOAD_SUCCEEDED_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun postImageUploadFailedQueue(): Queue {
        return QueueBuilder.durable(POST_IMAGE_UPLOAD_FAILED_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", POST_IMAGE_UPLOAD_FAILED_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    // Post Dead Letter Queues
    @Bean
    fun postCreationDlq(): Queue {
        return QueueBuilder.durable(POST_CREATION_DLQ).build()
    }

    @Bean
    fun postImageUploadSucceededDlq(): Queue {
        return QueueBuilder.durable(POST_IMAGE_UPLOAD_SUCCEEDED_DLQ).build()
    }

    @Bean
    fun postImageUploadFailedDlq(): Queue {
        return QueueBuilder.durable(POST_IMAGE_UPLOAD_FAILED_DLQ).build()
    }

    // Notification Queue
    @Bean
    fun notificationQueue(): Queue {
        return QueueBuilder.durable(NOTIFICATION_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", NOTIFICATION_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun registrationStatusUpdatedQueue(): Queue {
        return QueueBuilder.durable(REGISTRATION_STATUS_UPDATED_QUEUE)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", REGISTRATION_STATUS_UPDATED_DLQ)
            .withArgument("x-message-ttl", MESSAGE_TTL)
            .build()
    }

    @Bean
    fun notificationDlq(): Queue {
        return QueueBuilder.durable(NOTIFICATION_DLQ).build()
    }

    @Bean
    fun registrationStatusUpdatedDlq(): Queue {
        return QueueBuilder.durable(REGISTRATION_STATUS_UPDATED_DLQ).build()
    }

    // Event Listeners
    @Bean
    fun bindNotification(
        notificationQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(notificationQueue).to(exchange).with(NOTIFICATION_ROUTING_KEY)
    }

    @Bean
    fun bindRegistrationStatusUpdated(
        registrationStatusUpdatedQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(registrationStatusUpdatedQueue).to(exchange).with(REGISTRATION_STATUS_UPDATED_ROUTING_KEY)
    }

    // Post Bindings
    @Bean
    fun bindPostCreationPending(
        @Qualifier("postCreationPendingQueue") pendingQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(pendingQueue).to(exchange).with(POST_CREATION_PENDING_ROUTING_KEY)
    }

    @Bean
    fun bindPostImageUploadSucceeded(
        @Qualifier("postImageUploadSucceededQueue") succeededQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(succeededQueue).to(exchange).with(POST_IMAGE_UPLOAD_SUCCEEDED_ROUTING_KEY)
    }

    @Bean
    fun bindPostImageUploadFailed(
        @Qualifier("postImageUploadFailedQueue") failedQueue: Queue,
        exchange: TopicExchange
    ): Binding {
        return BindingBuilder.bind(failedQueue).to(exchange).with(POST_IMAGE_UPLOAD_FAILED_ROUTING_KEY)
    }
}