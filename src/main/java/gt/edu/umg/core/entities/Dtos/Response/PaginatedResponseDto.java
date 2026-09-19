package gt.edu.umg.core.entities.Dtos.Response;

import java.util.List;
import org.springframework.data.domain.Page;

public class PaginatedResponseDto<T> {

    private List<T> data;
    private Metadata metadata;

    public PaginatedResponseDto() {
    }

    public PaginatedResponseDto(List<T> data, Metadata metadata) {
        this.data = data;
        this.metadata = metadata;
    }

    public static <T> PaginatedResponseDto<T> fromPage(Page<T> page) {
        Metadata meta = new Metadata(
                page.getTotalElements(),
                page.getNumber(),
                page.getSize(),
                page.getTotalPages(),
                page.hasPrevious(),
                page.hasNext()
        );
        return new PaginatedResponseDto<>(page.getContent(), meta);
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    public static class Metadata {
        private long totalRecords;
        private int page;
        private int pageSize;
        private int totalPages;
        private boolean hasPreviousPage;
        private boolean hasNextPage;

        public Metadata() {
        }

        public Metadata(long totalRecords, int page, int pageSize, int totalPages, boolean hasPreviousPage, boolean hasNextPage) {
            this.totalRecords = totalRecords;
            this.page = page;
            this.pageSize = pageSize;
            this.totalPages = totalPages;
            this.hasPreviousPage = hasPreviousPage;
            this.hasNextPage = hasNextPage;
        }

        public long getTotalRecords() {
            return totalRecords;
        }

        public void setTotalRecords(long totalRecords) {
            this.totalRecords = totalRecords;
        }

        public int getPage() {
            return page;
        }

        public void setPage(int page) {
            this.page = page;
        }

        public int getPageSize() {
            return pageSize;
        }

        public void setPageSize(int pageSize) {
            this.pageSize = pageSize;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }

        public boolean isHasPreviousPage() {
            return hasPreviousPage;
        }

        public void setHasPreviousPage(boolean hasPreviousPage) {
            this.hasPreviousPage = hasPreviousPage;
        }

        public boolean isHasNextPage() {
            return hasNextPage;
        }

        public void setHasNextPage(boolean hasNextPage) {
            this.hasNextPage = hasNextPage;
        }
    }
}
