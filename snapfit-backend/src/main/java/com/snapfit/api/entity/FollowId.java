package com.snapfit.api.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FollowId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private User follower;
    private User followee;
    
    public FollowId(User follower, User followee) {
        this.follower = follower;
        this.followee = followee;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FollowId followId = (FollowId) o;
        return Objects.equals(follower, followId.follower) && 
               Objects.equals(followee, followId.followee);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(follower, followee);
    }
}
