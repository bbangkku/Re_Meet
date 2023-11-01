package com.example.remeet.controller;

import com.example.remeet.dto.ModelBoardCreateDto;
import com.example.remeet.dto.ModelBoardDetailDto;
import com.example.remeet.dto.ModelBoardDto;
import com.example.remeet.entity.ModelBoardEntity;
import com.example.remeet.service.ModelBoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;


import java.util.List;

@RestController
@RequestMapping("/model")
public class ModelBoardController {
    private final ModelBoardService modelBoardService;
    public ModelBoardController(ModelBoardService modelBoardService) {
        this.modelBoardService = modelBoardService;
    }
    @GetMapping
    public ResponseEntity<List<ModelBoardDto>> getModelBoard(@RequestParam("option") String option){
        List<ModelBoardDto> modelBoardDtos = modelBoardService.findByOption(option);
        return ResponseEntity.ok(modelBoardDtos);
    }

    @GetMapping("/{modelNo}")
    public ResponseEntity<ModelBoardDetailDto> getModelBoardDetail(@PathVariable Integer modelNo){
        ModelBoardDetailDto modelBoardDetailDto = modelBoardService.getModelBoardDetailById(modelNo)
                .orElseThrow(() -> new IllegalArgumentException("모델넘버가 존재하지 않음: " + modelNo));

        return ResponseEntity.ok(modelBoardDetailDto);
    }
    @GetMapping("/video/{modelNo}")
    public ResponseEntity<List<String>> getVideoPathsByModelNo(@PathVariable Integer modelNo) {
        return ResponseEntity.ok(modelBoardService.getVideoPathsByModelNo(modelNo));
    }

    @GetMapping("/voice/{modelNo}")
    public ResponseEntity<List<String>> getVoicePathsByModelNo(@PathVariable Integer modelNo) {
        return ResponseEntity.ok(modelBoardService.getVoicePathsByModelNo(modelNo));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ModelBoardDetailDto> createModelBoard(
            @RequestParam("modelName") String modelName,
            @RequestParam("gender") char gender,
            @RequestParam("imagePath") String imagePath,
            @RequestParam("conversationText") String conversationText,
            HttpServletRequest request
    ) {
        ModelBoardCreateDto modelBoardCreateDto = new ModelBoardCreateDto(
                modelName, gender, imagePath, conversationText
        );

        Integer userNo = (Integer) request.getAttribute("userNo");
        Integer modelNo = modelBoardService.createModelBoard(modelBoardCreateDto, userNo);
        ModelBoardDetailDto modelBoardDetailDto = modelBoardService.getModelBoardDetailById(modelNo)
                .orElseThrow(() -> new IllegalArgumentException("생성 후 오류가 있음"));

        return ResponseEntity.ok(modelBoardDetailDto);

    }

}