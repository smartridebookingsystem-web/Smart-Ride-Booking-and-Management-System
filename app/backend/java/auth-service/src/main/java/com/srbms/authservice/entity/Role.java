package com.srbms.authservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "role_value", nullable = false, unique = true)
    private String roleValue;

    public Role() {}

    public Role(String roleValue) {
        this.roleValue = roleValue;
    }

    public Role(Integer roleId, String roleValue) {
        this.roleId = roleId;
        this.roleValue = roleValue;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleValue() {
        return roleValue;
    }

    public void setRoleValue(String roleValue) {
        this.roleValue = roleValue;
    }
}
