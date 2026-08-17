package com.projectmanagement.domain.model;

/**
 * Represents the lifecycle status of a Project.
 */
public enum ProjectStatus {

    /** Project is currently active and in progress. */
    ACTIVE,

    /** Project has been completed and archived for reference. */
    ARCHIVED,

    /** Project has been soft-deleted and is no longer visible in normal queries. */
    DELETED
}
