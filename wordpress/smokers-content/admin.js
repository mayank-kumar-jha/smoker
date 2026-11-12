jQuery(function($){
 $('.smokers-media-pick').on('click',function(){const field=$(this).closest('.smokers-field');const frame=wp.media({title:'Choose Smokers artwork',multiple:false,library:{type:['image','video']}});frame.on('select',()=>{const file=frame.state().get('selection').first().toJSON();field.find('.smokers-media-id').val(file.id);field.find('.smokers-media-preview').attr('src',file.url)});frame.open()});
 $('.smokers-media-reset').on('click',function(){$(this).closest('.smokers-field').find('.smokers-media-id').val(0);$(this).text('Original will return after saving')});
});
