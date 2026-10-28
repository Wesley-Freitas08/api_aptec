package tarefas02.api.models.projections;


public interface TaskProjection {
    Long getId();
    String getTitle();
    String getDescription();
    Boolean getCompleted();
    String getCreatedAt();
    String getUpdatedAt();
}
public class TaskProjection {
    
}
